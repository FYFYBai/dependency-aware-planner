import api from "./client";

/* -------------------- Types -------------------- */
export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface BoardList {
  id: number;
  name: string;
  position: number;
  createdAt: string;
  tasks: Task[];
}

export interface Task {
  id: number;
  name: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
}

/* -------------------- API Calls -------------------- */

// Fetch one project by ID
export const getProject = async (projectId: number) => {
  const res = await api.get<Project>(`/projects/${projectId}`);
  return res.data;
};

// Fetch all lists for a project
export const getLists = async (projectId: number) => {
  const res = await api.get<BoardList[]>(`/lists/project/${projectId}`);
  return res.data;
};

// Create a new list for a project
export const createList = async (projectId: number, name: string) => {
  const res = await api.post<BoardList>(`/lists`, {
    name,
    project: { id: projectId },
  });
  return res.data;
};

// Create a new task inside a list
export const createTask = async (listId: number, task: Partial<Task>) => {
  const res = await api.post<Task>(`/tasks`, {
    name: task.name, // ensure it's always included
    description: task.description,
    startDate: task.startDate,
    dueDate: task.dueDate,
    list: { id: listId }, //match backend entity
  });
  return res.data;
};

// ---- LISTS ----
export const updateList = async (
  id: number,
  name: string,
  position: number
) => {
  const res = await api.put<BoardList>(`/lists/${id}`, {
    id,
    name,
    position,
  });
  return res.data;
};

export const deleteList = async (id: number) => {
  await api.delete(`/lists/${id}`);
};

// ---- TASKS ----
export const updateTask = async (id: number, task: Partial<Task>) => {
  const res = await api.put<Task>(`/tasks/${id}`, {
    name: task.name,
    description: task.description,
    startDate: task.startDate,
    dueDate: task.dueDate,
  });
  return res.data;
};

export const deleteTask = async (id: number) => {
  await api.delete(`/tasks/${id}`);
};
