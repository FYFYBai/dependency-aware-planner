import api from "./client";

/* ---------------------- Types ---------------------- */
export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface Task {
  id: number;
  name: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  position?: number; // optional while DB catches up
  listId?: number; // used by FE; BE expects { list: { id } }
}

export interface BoardList {
  id: number;
  name: string;
  position?: number;
  createdAt: string;
  tasks: Task[];
}

/* ---------------------- Projects ---------------------- */
export const getProject = async (projectId: number): Promise<Project> => {
  const res = await api.get<Project>(`/projects/${projectId}`);
  return res.data;
};

/* ---------------------- Lists ---------------------- */
export const getLists = async (projectId: number): Promise<BoardList[]> => {
  const res = await api.get<BoardList[]>(`/lists/project/${projectId}`);
  return res.data;
};

export const createList = async (projectId: number, name: string) => {
  // Backend expects entity shape with nested relation for project
  const res = await api.post<BoardList>(`/lists`, {
    name,
    project: { id: projectId },
  });
  return res.data;
};

export const updateList = async (
  id: number,
  name: string,
  position: number
) => {
  const res = await api.put<BoardList>(`/lists/${id}`, { id, name, position });
  return res.data;
};

export const deleteList = async (id: number) => {
  await api.delete(`/lists/${id}`);
};

/* ---------------------- Tasks ---------------------- */
export const createTask = async (
  listId: number,
  task: {
    name: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
  }
) => {
  // Wrap listId for backend
  const res = await api.post<Task>(`/tasks`, { ...task, list: { id: listId } });
  return res.data;
};

export const updateTask = async (id: number, task: Partial<Task>) => {
  // Convert FE { listId } to BE { list: { id } }
  const payload: any = { ...task };
  if (task.listId) {
    payload.list = { id: task.listId };
    delete payload.listId;
  }
  const res = await api.put<Task>(`/tasks/${id}`, payload);
  return res.data;
};

export const deleteTask = async (id: number) => {
  await api.delete(`/tasks/${id}`);
};
