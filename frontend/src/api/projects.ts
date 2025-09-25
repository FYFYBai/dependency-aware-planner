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
  position?: number;
  listId?: number;
}

export interface BoardList {
  id: number;
  name: string;
  position?: number;
  createdAt: string;
  tasks: Task[];
}

/* ---------------------- Projects ---------------------- */
export const getAllProjects = async (): Promise<Project[]> => {
  const res = await api.get<Project[]>('/projects');
  return res.data;
};

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
  const res = await api.post<Task>(`/tasks`, { ...task, listId });
  return res.data;
};

export const updateTask = async (id: number, task: Partial<Task>) => {
  const res = await api.put<Task>(`/tasks/${id}`, task);

  return res.data;
};

export const deleteTask = async (id: number) => {
  await api.delete(`/tasks/${id}`);
};

/* ---------------------- Collaboration ---------------------- */
export interface ProjectCollaborator {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  username: string;
  userEmail: string;
  role: string;
  invitedByUsername: string;
  joinedAt: string;
}

export interface ProjectInvitation {
  id: number;
  projectId: number;
  projectName: string;
  invitedByUsername: string;
  invitedEmail: string;
  role: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
}

export interface InviteUserRequest {
  email: string;
  role: string;
  expirationHours?: number;
}

export const getProjectCollaborators = async (projectId: number): Promise<ProjectCollaborator[]> => {
  const res = await api.get<ProjectCollaborator[]>(`/projects/${projectId}/collaboration/collaborators`);
  return res.data;
};

export const getProjectInvitations = async (projectId: number): Promise<ProjectInvitation[]> => {
  const res = await api.get<ProjectInvitation[]>(`/projects/${projectId}/collaboration/invitations`);
  return res.data;
};

export const inviteUserToProject = async (projectId: number, request: InviteUserRequest): Promise<ProjectInvitation> => {
  const res = await api.post<ProjectInvitation>(`/projects/${projectId}/collaboration/invite`, request);
  return res.data;
};

export const removeCollaborator = async (projectId: number, userId: number): Promise<void> => {
  await api.delete(`/projects/${projectId}/collaboration/collaborators/${userId}`);
};

export const checkProjectAccess = async (projectId: number): Promise<boolean> => {
  const res = await api.get<boolean>(`/projects/${projectId}/collaboration/check-access`);
  return res.data;
};

export const getUserInvitations = async (): Promise<ProjectInvitation[]> => {
  const res = await api.get<ProjectInvitation[]>('/invitations/my-invitations');
  return res.data;
};

export const acceptInvitation = async (invitationId: string): Promise<ProjectCollaborator> => {
  const res = await api.post<ProjectCollaborator>('/invitations/public/respond-by-id', {
    id: parseInt(invitationId),
    response: 'accept'
  });
  return res.data;
};

export const declineInvitation = async (invitationId: string): Promise<void> => {
  await api.post('/invitations/public/respond-by-id', {
    id: parseInt(invitationId),
    response: 'decline'
  });
};