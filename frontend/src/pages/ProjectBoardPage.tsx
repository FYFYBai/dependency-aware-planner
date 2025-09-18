import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
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
} from "../api/projects";
import { Pencil, Trash2 } from "lucide-react";

/* ---- Local fallback types ---- */
type TaskType = {
  id: number;
  name: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
};
type BoardListType = {
  id: number;
  name: string;
  position: number;
  tasks: TaskType[];
};
type ProjectType = {
  id: number;
  name: string;
};

/* ---------------------- Task Section ---------------------- */
function TaskSection({
  projectId,
  listId,
  tasks,
}: {
  projectId: number;
  listId: number;
  tasks: TaskType[];
}) {
  const queryClient = useQueryClient();
  const [addingTask, setAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [newTask, setNewTask] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const addTaskMutation = useMutation({
    mutationFn: (taskData: {
      name: string;
      description: string;
      startDate: string;
      dueDate: string;
    }) => createTask(listId, taskData),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["lists", projectId] }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (task: TaskType) =>
      updateTask(task.id, {
        name: task.name,
        description: task.description,
        startDate: task.startDate,
        dueDate: task.dueDate,
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
    addTaskMutation.mutate(
      { name: newTask, description, startDate, dueDate },
      {
        onSuccess: () => {
          setNewTask("");
          setDescription("");
          setStartDate("");
          setDueDate("");
          setAddingTask(false);
        },
      }
    );
  };

  return (
    <>
      {tasks.map((task) =>
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
                setEditingTask({ ...editingTask, description: e.target.value })
              }
              className="mb-2"
            />
            <MDBInput
              label="Start Date"
              type="date"
              value={editingTask.startDate || ""}
              onChange={(e) =>
                setEditingTask({ ...editingTask, startDate: e.target.value })
              }
              className="mb-2"
            />
            <MDBInput
              label="Due Date"
              type="date"
              value={editingTask.dueDate || ""}
              onChange={(e) =>
                setEditingTask({ ...editingTask, dueDate: e.target.value })
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
          <motion.div
            key={task.id}
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
              <div className="text-muted small mt-1">{task.description}</div>
            )}
            {(task.startDate || task.dueDate) && (
              <div className="text-muted small mt-1">
                {task.startDate && <>Start: {task.startDate} </>}
                {task.dueDate && <>• Due: {task.dueDate}</>}
              </div>
            )}
          </motion.div>
        )
      )}

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

/* ---------------------- Add List Card ---------------------- */
function AddListCard({ projectId }: { projectId: number }) {
  const queryClient = useQueryClient();
  const [addingList, setAddingList] = useState(false);
  const [newList, setNewList] = useState("");
  const [error, setError] = useState("");

  const addListMutation = useMutation({
    mutationFn: (listData: { name: string }) =>
      createList(projectId, listData.name),
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
      { name: newList },
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

/* ---------------------- Project Board Page ---------------------- */
export default function ProjectBoardPage() {
  const { projectId: projectIdParam } = useParams();
  const projectId = Number(projectIdParam);
  const queryClient = useQueryClient();

  const { data: project } = useQuery<ProjectType>({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled: Number.isFinite(projectId),
  });

  const { data: lists } = useQuery<BoardListType[]>({
    queryKey: ["lists", projectId],
    queryFn: () => getLists(projectId),
    enabled: Number.isFinite(projectId),
  });

  const [editingList, setEditingList] = useState<BoardListType | null>(null);

  const updateListMutation = useMutation({
    mutationFn: (list: BoardListType) =>
      updateList(list.id, list.name, list.position),
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

  if (!Number.isFinite(projectId)) return <div>Invalid project id</div>;
  if (!project || !lists) return <div>Loading...</div>;

  return (
    <div className="min-vh-100" style={{ background: "#f8f9fa" }}>
      <Navbar />
      <MDBContainer fluid className="py-4">
        <h3 className="mb-4">{project.name}</h3>

        <MDBRow>
          {lists.map((list) => (
            <MDBCol key={list.id} md="3">
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
                          onClick={() => deleteListMutation.mutate(list.id)}
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
                        onClick={() => updateListMutation.mutate(editingList)}
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
                    listId={list.id}
                    tasks={list.tasks || []}
                  />
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))}

          {/* ✅ Always show Add List card */}
          <MDBCol md="3">
            <AddListCard projectId={projectId} />
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}
