import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
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
  type Project,
  type BoardList,
  type Task,
} from "../api/projects";
import { Pencil, Trash2 } from "lucide-react";
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

/* ---------------- Helpers to avoid ID collisions ---------------- */
const listKey = (id: number) => `list-${id}`;
const taskKey = (id: number) => `task-${id}`;
const isListKey = (id: UniqueIdentifier) => String(id).startsWith("list-");
const isTaskKey = (id: UniqueIdentifier) => String(id).startsWith("task-");
const parseKey = (id: UniqueIdentifier) => Number(String(id).split("-")[1]);

/* ---------------- Sortable/droppable wrappers ---------------- */
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

/* ---------------- Tasks (per-list) ---------------- */
function TaskSection({
  projectId,
  list,
}: {
  projectId: number;
  list: BoardList;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", projectId] });
      setEditingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["lists", projectId] }),
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
          {list.tasks.map((task) =>
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
                <MDBBtn
                  size="sm"
                  className="me-2"
                  onClick={() => updateTaskMutation.mutate(editingTask)}
                >
                  Update
                </MDBBtn>
                <MDBBtn outline size="sm" onClick={() => setEditingTask(null)}>
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

/* ---------------- Add-list card ---------------- */
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

/* ---------------- Page ---------------- */
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

  // central mutation for drag-and-drop task updates
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

    // ----- List reorder -----
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
      // optimistic cache update
      queryClient.setQueryData<BoardList[]>(["lists", projectId], reordered);
      // persist new positions
      reordered.forEach((list, index) => {
        updateList(list.id, list.name, index);
      });
      return;
    }

    // ----- Task reorder / move between lists -----
    if (!isTaskKey(aId)) return;

    const activeTaskId = parseKey(aId);

    // find source list
    const sourceList = lists.find((l) =>
      l.tasks.some((t) => t.id === activeTaskId)
    );
    if (!sourceList) return;

    // find target list & target index
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
      targetIndex = targetList.tasks.length; // drop to end
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

    // same list reorder
    if (sourceList.id === targetList.id) {
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

    // moving across lists
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

    // persist positions for both lists
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
      <MDBContainer fluid className="py-4">
        <h3 className="mb-4">{project.name}</h3>

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

                        {/* Tasks */}
                        <TaskSection projectId={projectId} list={list} />
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
      </MDBContainer>
    </div>
  );
}
