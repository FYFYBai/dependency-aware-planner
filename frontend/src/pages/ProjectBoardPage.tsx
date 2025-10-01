import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBInput,
  MDBBtn,
} from "mdb-react-ui-kit";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  getProject,
  getLists,
  createList,
  createTask,
  updateList,
  deleteList,
  updateTask,
  deleteTask,
  addDependency,
  removeDependency,
  getProjectCollaborators,
  getProjectInvitations,
  inviteUserToProject,
  removeCollaborator,
  type Project,
  type BoardList,
  type Task,
  type ProjectCollaborator,
  type ProjectInvitation,
  type InviteUserRequest,
} from "../api/projects";
import { Pencil, Trash2, Users, UserPlus, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GraphView from "../components/GraphView";
import GanttView from "../components/GanttView";

// Drag and drop ID helpers to avoid collisions between lists and tasks
const listKey = (id: number) => `list-${id}`;
const taskKey = (id: number) => `task-${id}`;
const isListKey = (id: UniqueIdentifier) => String(id).startsWith("list-");
const isTaskKey = (id: UniqueIdentifier) => String(id).startsWith("task-");
const parseKey = (id: UniqueIdentifier) => Number(String(id).split("-")[1]);

function SortableItem({
  id,
  children,
}: {
  id: UniqueIdentifier;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function Droppable({
  id,
  children,
}: {
  id: UniqueIdentifier;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} style={{ minHeight: 4 }}>
      {children}
    </div>
  );
}

function TaskSection({
  projectId,
  list,
  allTasks,
}: {
  projectId: number;
  list: BoardList;
  allTasks: Task[];
}) {
  const queryClient = useQueryClient();
  const [addingTask, setAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const addTaskMutation = useMutation({
    mutationFn: () =>
      createTask(list.id, {
        name: newTask,
        description,
        startDate,
        dueDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", projectId] });
      setNewTask("");
      setDescription("");
      setStartDate("");
      setDueDate("");
      setAddingTask(false);
    },
  });

  // Update task and synchronize dependency relationships
  const updateTaskMutation = useMutation({
    mutationFn: (task: Task) =>
      updateTask(task.id, {
        id: task.id,
        name: task.name,
        description: task.description ?? undefined,
        startDate: task.startDate ?? undefined,
        dueDate: task.dueDate ?? undefined,
        listId: list.id,
        position: task.position ?? undefined,
      }),

    onSuccess: async (updated) => {
      // Refresh tasks
      await queryClient.invalidateQueries({ queryKey: ["lists", projectId] });

      if (editingTask) {
        // Sync dependencies: add new ones and remove old ones
        const prevIds = updated.dependencyIds || [];
        const nextIds = editingTask.dependencyIds || [];
        const ops: Promise<any>[] = [];

        for (const id of nextIds.filter((id) => !prevIds.includes(id))) {
          ops.push(addDependency(updated.id, id));
        }

        for (const id of prevIds.filter((id) => !nextIds.includes(id))) {
          ops.push(removeDependency(updated.id, id));
        }

        if (ops.length > 0) {
          await Promise.all(ops);
          await queryClient.invalidateQueries({
            queryKey: ["dependencies", updated.id],
          });
          await queryClient.invalidateQueries({
            queryKey: ["lists", projectId],
          });
        }
      }

      setEditingTask(null);
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to update task";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Response) {
        try {
          const data = await error.json();
          if (data?.message) {
            errorMessage = data.message;
          }
        } catch (_) {
          // ignore parsing failure
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", projectId] });
    },
  });

  const handleAddTask = () => {
    if (!newTask.trim()) {
      setError("Task name is required");
      return;
    }
    setError("");
    addTaskMutation.mutate();
  };

  return (
    <>
      <Droppable id={listKey(list.id)}>
        <SortableContext
          items={list.tasks.map((t) => taskKey(t.id))}
          strategy={verticalListSortingStrategy}
        >
          {[...list.tasks]
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((task) =>
              editingTask && editingTask.id === task.id ? (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-2 mb-2 bg-light border rounded text-start"
                >
                  <MDBInput
                    label="Task Name *"
                    value={editingTask.name}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, name: e.target.value })
                    }
                    className="mb-2"
                  />
                  <MDBInput
                    label="Description"
                    value={editingTask.description || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                    className="mb-2"
                  />
                  <MDBInput
                    label="Start Date"
                    type="date"
                    value={editingTask.startDate || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        startDate: e.target.value,
                      })
                    }
                    className="mb-2"
                  />
                  <MDBInput
                    label="Due Date"
                    type="date"
                    value={editingTask.dueDate || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        dueDate: e.target.value,
                      })
                    }
                    className="mb-2"
                  />

                  {/* Dependencies */}
                  <label className="form-label">Dependencies</label>
                  <select
                    multiple
                    value={(editingTask.dependencyIds || []).map(String)}
                    onChange={(e) => {
                      const selected = Array.from(
                        e.target.selectedOptions,
                        (opt) => Number(opt.value)
                      );
                      setEditingTask({
                        ...editingTask,
                        dependencyIds: selected,
                      });
                    }}
                    className="form-select mb-2"
                  >
                    {allTasks
                      .filter((t) => t.id !== editingTask.id)
                      .map((t) => (
                        <option key={t.id} value={String(t.id)}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                  {error && <div className="text-danger mb-2">{error}</div>}
                  <MDBBtn
                    size="sm"
                    className="me-2"
                    onClick={() => updateTaskMutation.mutate(editingTask)}
                  >
                    Update
                  </MDBBtn>
                  <MDBBtn
                    outline
                    size="sm"
                    onClick={() => setEditingTask(null)}
                  >
                    Cancel
                  </MDBBtn>
                </motion.div>
              ) : (
                <SortableItem key={task.id} id={taskKey(task.id)}>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-2 mb-2 bg-light border rounded text-start"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{task.name}</strong>
                      <div className="d-flex gap-2">
                        <span title="Edit task">
                          <Pencil
                            size={16}
                            className="text-primary"
                            style={{ cursor: "pointer" }}
                            onClick={() => setEditingTask(task)}
                          />
                        </span>
                        <span title="Delete task">
                          <Trash2
                            size={16}
                            className="text-danger"
                            style={{ cursor: "pointer" }}
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                          />
                        </span>
                      </div>
                    </div>
                    {task.description && (
                      <div className="text-muted small mt-1">
                        {task.description}
                      </div>
                    )}
                    {(task.startDate || task.dueDate) && (
                      <div className="text-muted small mt-1">
                        {task.startDate && <>Start: {task.startDate} </>}
                        {task.dueDate && <>• Due: {task.dueDate}</>}
                      </div>
                    )}
                    {task.dependencyIds && task.dependencyIds.length > 0 && (
                      <div className="text-muted small mt-1">
                        <strong>Depends on:</strong>{" "}
                        {task.dependencyIds.map((id) => {
                          const depTask = allTasks.find((t) => t.id === id);
                          return (
                            <span
                              key={id}
                              className="badge bg-secondary me-1 d-inline-flex align-items-center"
                            >
                              {depTask ? depTask.name : `#${id}`}
                              <button
                                type="button"
                                className="btn-close btn-close-white btn-sm ms-1"
                                aria-label="Remove"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Remove dependency on "${
                                        depTask?.name ?? id
                                      }"?`
                                    )
                                  ) {
                                    removeDependency(task.id, id)
                                      .then(() => {
                                        if (
                                          editingTask &&
                                          editingTask.id === task.id
                                        ) {
                                          setEditingTask({
                                            ...editingTask,
                                            dependencyIds:
                                              editingTask.dependencyIds?.filter(
                                                (d) => d !== id
                                              ),
                                          });
                                        }
                                        queryClient.invalidateQueries({
                                          queryKey: ["lists", projectId],
                                        });
                                      })
                                      .catch((err) =>
                                        console.error(
                                          "Failed to remove dependency",
                                          err
                                        )
                                      );
                                  }
                                }}
                                style={{ fontSize: "0.6rem" }}
                              />
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                </SortableItem>
              )
            )}
        </SortableContext>
      </Droppable>

      {addingTask ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <MDBInput
            label="Task Name *"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="mb-2"
          />
          <MDBInput
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-2"
          />
          <MDBInput
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mb-2"
          />
          <MDBInput
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mb-2"
          />
          {error && <div className="text-danger mb-2">{error}</div>}
          <MDBBtn size="sm" className="me-2" onClick={handleAddTask}>
            Add
          </MDBBtn>
          <MDBBtn outline size="sm" onClick={() => setAddingTask(false)}>
            Cancel
          </MDBBtn>
        </motion.div>
      ) : (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 mt-2 bg-white border rounded text-center text-primary"
          style={{ cursor: "pointer", fontWeight: 500 }}
          onClick={() => setAddingTask(true)}
        >
          + Add new task
        </motion.div>
      )}
    </>
  );
}

function CollaborationPanel({ projectId }: { projectId: number }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showPanel, setShowPanel] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [error, setError] = useState("");

  const { data: collaborators } = useQuery<ProjectCollaborator[]>({
    queryKey: ["collaborators", projectId],
    queryFn: () => getProjectCollaborators(projectId),
    enabled: showPanel,
  });

  // Determine user's role: admin can manage, owners (not in collaborators list) can manage
  const getCurrentUserRole = () => {
    if (!collaborators || !user) return null;
    const userCollaborator = collaborators.find(c => c.username === user.username);
    return userCollaborator ? userCollaborator.role : null;
  };

  const currentUserRole = getCurrentUserRole();
  const canManageCollaborators = currentUserRole === 'admin' || 
    (currentUserRole === null && user);

  const { data: invitations } = useQuery<ProjectInvitation[]>({
    queryKey: ["invitations", projectId],
    queryFn: () => getProjectInvitations(projectId),
    enabled: showPanel,
  });

  const inviteMutation = useMutation({
    mutationFn: (request: InviteUserRequest) =>
      inviteUserToProject(projectId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations", projectId] });
      setInviteEmail("");
      setInviteRole("member");
      setShowInviteForm(false);
      setError("");
    },
    onError: (error: unknown) => {
      let errorMessage = "Failed to send invitation";
      if (error && typeof error === "object" && "response" in error) {
        const responseError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage = responseError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: number) => removeCollaborator(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators", projectId] });
    },
  });

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      setError("Email is required");
      return;
    }
    setError("");
    inviteMutation.mutate({
      email: inviteEmail.trim(),
      role: inviteRole,
      expirationHours: 168,
    });
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn btn-outline-primary btn-sm"
        onClick={() => setShowPanel(true)}
      >
        <Users size={16} className="me-2" />
        Manage Collaboration
      </motion.button>

      {showPanel && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPanel(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white border rounded shadow-lg p-4"
            style={{ maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <Users size={20} className="me-2" />
                Collaboration
              </h5>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowPanel(false)}
              >
                <X size={16} />
              </button>
            </div>

      {showInviteForm ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 p-3 bg-light border rounded"
        >
          <h6 className="mb-3">Invite New Collaborator</h6>
          <MDBInput
            label="Email Address *"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="mb-2"
          />
          <div className="mb-2">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              {/* <option value="member">Member</option> */}
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <div className="text-danger mb-2">{error}</div>}
          <div className="d-flex gap-2">
            <MDBBtn
              size="sm"
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
            >
              {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
            </MDBBtn>
            <MDBBtn outline size="sm" onClick={() => setShowInviteForm(false)}>
              Cancel
            </MDBBtn>
          </div>
        </motion.div>
      ) : (
        canManageCollaborators && (
          <MDBBtn
            size="sm"
            className="mb-3"
            onClick={() => setShowInviteForm(true)}
          >
            <UserPlus size={16} className="me-2" />
            Invite Collaborator
          </MDBBtn>
        )
      )}

      <div className="mb-3">
        <h6 className="mb-2">Current Collaborators</h6>
        {collaborators?.length === 0 ? (
          <p className="text-muted small">No collaborators yet</p>
        ) : (
          <div className="list-group">
            {collaborators?.map((collaborator) => (
              <div
                key={collaborator.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-bold">{collaborator.username}</div>
                  <small className="text-muted">{collaborator.userEmail}</small>
                  <div>
                    <span
                      className={`badge ${
                        collaborator.role === "admin"
                          ? "bg-warning"
                          : collaborator.role === "owner"
                          ? "bg-danger"
                          : "bg-info"
                      }`}
                    >
                      {collaborator.role}
                    </span>
                  </div>
                </div>
                {canManageCollaborators && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeMutation.mutate(collaborator.userId)}
                    disabled={removeMutation.isPending}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {invitations && invitations.length > 0 && (
        <div>
          <h6 className="mb-2">Pending Invitations</h6>
          <div className="list-group">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="list-group-item">
                <div className="fw-bold">{invitation.invitedEmail}</div>
                <small className="text-muted">
                  Invited by {invitation.invitedByUsername} • Role:{" "}
                  {invitation.role}
                </small>
                <div>
                  <span
                    className={`badge ${
                      invitation.status === "PENDING"
                        ? "bg-warning"
                        : invitation.status === "ACCEPTED"
                        ? "bg-success"
                        : invitation.status === "DECLINED"
                        ? "bg-danger"
                        : "bg-secondary"
                    }`}
                  >
                    {invitation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
          </motion.div>
        </div>
      )}
    </>
  );
}

function AddListCard({ projectId }: { projectId: number }) {
  const queryClient = useQueryClient();
  const [addingList, setAddingList] = useState(false);
  const [newList, setNewList] = useState("");
  const [error, setError] = useState("");

  const addListMutation = useMutation({
    mutationFn: (payload: { name: string }) =>
      createList(projectId, payload.name),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["lists", projectId] }),
  });

  const handleAddList = () => {
    if (!newList.trim()) {
      setError("List name is required");
      return;
    }
    setError("");
    addListMutation.mutate(
      { name: newList.trim() },
      {
        onSuccess: () => {
          setNewList("");
          setAddingList(false);
        },
      }
    );
  };

  return addingList ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="shadow-sm border-0 mb-4 p-3 bg-white"
    >
      <MDBInput
        label="List Name *"
        value={newList}
        onChange={(e) => setNewList(e.target.value)}
        className="mb-2"
      />
      {error && <div className="text-danger mb-2">{error}</div>}
      <MDBBtn size="sm" className="me-2" onClick={handleAddList}>
        Add
      </MDBBtn>
      <MDBBtn outline size="sm" onClick={() => setAddingList(false)}>
        Cancel
      </MDBBtn>
    </motion.div>
  ) : (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="shadow-sm border-0 mb-4 d-flex align-items-center justify-content-center bg-white"
      style={{ height: 100, cursor: "pointer" }}
      onClick={() => setAddingList(true)}
    >
      <span className="text-primary">+ Add new list</span>
    </motion.div>
  );
}

export default function ProjectBoardPage() {
  const { projectId: projectIdParam } = useParams();
  const projectId = Number(projectIdParam);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const { data: project } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled: Number.isFinite(projectId),
  });

  const { data: lists } = useQuery<BoardList[]>({
    queryKey: ["lists", projectId],
    queryFn: () => getLists(projectId),
    enabled: Number.isFinite(projectId),
  });

  const [view, setView] = useState<"board" | "graph" | "gantt">("board");
  const [editingList, setEditingList] = useState<BoardList | null>(null);

  const updateListMutation = useMutation({
    mutationFn: (list: BoardList) =>
      updateList(list.id, list.name, list.position ?? 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", projectId] });
      setEditingList(null);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: deleteList,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["lists", projectId] }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (payload: { id: number; data: Partial<Task> }) =>
      updateTask(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", projectId] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !lists) return;
    if (active.id === over.id) return;

    const aId = String(active.id);
    const oId = String(over.id);

    // Handle list reordering
    if (isListKey(aId) && isListKey(oId)) {
      const activeListId = parseKey(aId);
      const overListId = parseKey(oId);

      const oldIndex = lists.findIndex((l) => l.id === activeListId);
      const newIndex = lists.findIndex((l) => l.id === overListId);
      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = arrayMove(lists, oldIndex, newIndex).map((l, i) => ({
        ...l,
        position: i,
      }));
      queryClient.setQueryData<BoardList[]>(["lists", projectId], reordered);
      reordered.forEach((list, index) => {
        updateList(list.id, list.name, index);
      });
      return;
    }

    // Handle task movement between lists or within same list
    if (!isTaskKey(aId)) return;

    const activeTaskId = parseKey(aId);

    const sourceList = lists.find((l) =>
      l.tasks.some((t) => t.id === activeTaskId)
    );
    if (!sourceList) return;
    let targetList: BoardList | undefined;
    let targetIndex: number;

    if (isTaskKey(oId)) {
      const overTaskId = parseKey(oId);
      targetList = lists.find((l) => l.tasks.some((t) => t.id === overTaskId));
      if (!targetList) return;
      targetIndex = targetList.tasks.findIndex((t) => t.id === overTaskId);
    } else if (isListKey(oId)) {
      const overListId = parseKey(oId);
      targetList = lists.find((l) => l.id === overListId);
      if (!targetList) return;
      targetIndex = targetList.tasks.length;
    } else {
      return;
    }

    const sourceTasks = [...sourceList.tasks];
    const from = sourceTasks.findIndex((t) => t.id === activeTaskId);
    if (from < 0) return;
    const [movedTask] = sourceTasks.splice(from, 1);

    const targetTasks =
      sourceList.id === targetList.id
        ? [...sourceTasks]
        : [...targetList.tasks];

    if (sourceList.id === targetList.id) {
      // Task moved within same list - reorder positions
      const reordered = arrayMove(
        [...sourceList.tasks],
        from,
        Math.min(targetIndex, sourceList.tasks.length - 1)
      ).map((t, i) => ({ ...t, position: i }));

      const optimistic = lists.map((l) =>
        l.id === sourceList.id ? { ...l, tasks: reordered } : l
      );
      queryClient.setQueryData<BoardList[]>(["lists", projectId], optimistic);

      reordered.forEach((t, i) => {
        updateTaskMutation.mutate({
          id: t.id,
          data: {
            id: t.id,
            name: t.name,
            description: t.description,
            startDate: t.startDate,
            dueDate: t.dueDate,
            listId: sourceList.id,
            position: i,
          },
        });
      });
      return;
    }

    const insertAt = Math.min(targetIndex, targetTasks.length);
    targetTasks.splice(insertAt, 0, { ...movedTask, listId: targetList.id });

    const optimistic = lists.map((l) => {
      if (l.id === sourceList.id) {
        const withPos = sourceTasks.map((t, i) => ({ ...t, position: i }));
        return { ...l, tasks: withPos };
      }
      if (l.id === targetList!.id) {
        const withPos = targetTasks.map((t, i) => ({ ...t, position: i }));
        return { ...l, tasks: withPos };
      }
      return l;
    });
    queryClient.setQueryData<BoardList[]>(["lists", projectId], optimistic);

    sourceTasks.forEach((t, i) => {
      updateTaskMutation.mutate({
        id: t.id,
        data: {
          id: t.id,
          name: t.name,
          description: t.description,
          startDate: t.startDate,
          dueDate: t.dueDate,
          listId: sourceList.id,
          position: i,
        },
      });
    });
    targetTasks.forEach((t, i) => {
      updateTaskMutation.mutate({
        id: t.id,
        data: {
          id: t.id,
          name: t.name,
          description: t.description,
          startDate: t.startDate,
          dueDate: t.dueDate,
          listId: targetList!.id,
          position: i,
        },
      });
    });
  };

  if (!Number.isFinite(projectId)) return <div>Invalid project id</div>;
  if (!project || !lists) return <div>Loading...</div>;

  return (
    <div className="min-vh-100" style={{ background: "#f8f9fa" }}>
      <Navbar />
      <MDBContainer
        fluid
        className="py-4"
        style={{ minHeight: "calc(100vh - 80px)" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">{project.name}</h3>
          <CollaborationPanel projectId={projectId} />
        </div>

        <div className="btn-group mb-3">
          <button
            className={`btn btn-sm ${
              view === "board" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setView("board")}
          >
            Board
          </button>
          <button
            className={`btn btn-sm ${
              view === "graph" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setView("graph")}
          >
            Graph
          </button>
          <button
            className={`btn btn-sm ${
              view === "gantt" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setView("gantt")}
          >
            Gantt
          </button>
        </div>

        {view === "board" && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={lists.map((list) => listKey(list.id))}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
                {lists.map((list) => (
                  <SortableItem key={list.id} id={listKey(list.id)}>
                    <div className="w-[320px] shrink-0">
                      <MDBCard className="shadow-sm border-0 mb-4">
                        <MDBCardBody>
                          <MDBCardTitle className="h5 d-flex justify-content-between align-items-center">
                            <span>{list.name}</span>
                            <span className="d-flex gap-2">
                              <span title="Edit list">
                                <Pencil
                                  size={18}
                                  className="text-primary"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => setEditingList(list)}
                                />
                              </span>
                              <span title="Delete list">
                                <Trash2
                                  size={18}
                                  className="text-danger"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    deleteListMutation.mutate(list.id)
                                  }
                                />
                              </span>
                            </span>
                          </MDBCardTitle>

                          {editingList && editingList.id === list.id ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <MDBInput
                                label="List Name *"
                                value={editingList.name}
                                onChange={(e) =>
                                  setEditingList({
                                    ...editingList,
                                    name: e.target.value,
                                  })
                                }
                                className="mb-2"
                              />
                              <MDBBtn
                                size="sm"
                                className="me-2"
                                onClick={() =>
                                  updateListMutation.mutate(editingList)
                                }
                              >
                                Update
                              </MDBBtn>
                              <MDBBtn
                                outline
                                size="sm"
                                onClick={() => setEditingList(null)}
                              >
                                Cancel
                              </MDBBtn>
                            </motion.div>
                          ) : null}

                          <TaskSection
                            projectId={projectId}
                            list={list}
                            allTasks={lists.flatMap((l) => l.tasks)}
                          />
                        </MDBCardBody>
                      </MDBCard>
                    </div>
                  </SortableItem>
                ))}

                <div className="w-[320px] shrink-0">
                  <AddListCard projectId={projectId} />
                </div>
              </div>
            </SortableContext>
          </DndContext>
        )}

        {view === "graph" && (
          <GraphView tasks={lists.flatMap((l) => l.tasks)} />
        )}
        {view === "gantt" && (
          <GanttView tasks={lists.flatMap((l) => l.tasks)} />
        )}
      </MDBContainer>
    </div>
  );
}
