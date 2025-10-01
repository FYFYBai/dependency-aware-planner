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
  dependencyIds?: number[]; // optional, always normalized to []
}

export interface BoardList {
  id: number;
  name: string;
  position?: number;
  createdAt: string;
  tasks: Task[]; // always normalized to []
}

/** Dependency relation: taskId depends on dependsOnId */
export interface DependencyDto {
  id: number; // unique dependency row id
  taskId: number; // the task being blocked
  dependsOnId: number; // the prerequisite task
}

/* ---------------------- Projects ---------------------- */
export const getAllProjects = async (): Promise<Project[]> => {
  const res = await api.get<Project[]>("/projects");
  return res.data;
};

export const getProject = async (projectId: number): Promise<Project> => {
  const res = await api.get<Project>(`/projects/${projectId}`);
  return res.data;
};

/* ---------------------- Lists ---------------------- */
export const getLists = async (projectId: number): Promise<BoardList[]> => {
  const res = await api.get<BoardList[]>(`/lists/project/${projectId}`);
  // Normalize lists and tasks
  return res.data.map((list) => ({
    ...list,
    tasks: (list.tasks || []).map((t) => ({
      ...t,
      dependencyIds: t.dependencyIds || [],
    })),
  }));
};

export const createList = async (projectId: number, name: string) => {
  const res = await api.post<BoardList>(`/lists`, {
    name,
    project: { id: projectId },
  });
  // Normalize tasks
  return {
    ...res.data,
    tasks: (res.data.tasks || []).map((t) => ({
      ...t,
      dependencyIds: t.dependencyIds || [],
    })),
  };
};

export const updateList = async (
  id: number,
  name: string,
  position: number
) => {
  const res = await api.put<BoardList>(`/lists/${id}`, { id, name, position });
  // Normalize tasks
  return {
    ...res.data,
    tasks: (res.data.tasks || []).map((t) => ({
      ...t,
      dependencyIds: t.dependencyIds || [],
    })),
  };
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
  // Normalize dependencyIds
  return { ...res.data, dependencyIds: res.data.dependencyIds || [] };
};

export const updateTask = async (id: number, task: Partial<Task>) => {
  const res = await api.put<Task>(`/tasks/${id}`, task);
  // Normalize dependencyIds
  return { ...res.data, dependencyIds: res.data.dependencyIds || [] };
};

export const deleteTask = async (id: number) => {
  await api.delete(`/tasks/${id}`);
};

/* ---------------------- Task Dependencies ---------------------- */
// ---- Dependency API calls ----
// These functions wrap REST calls to the DependencyController.
// Ensure consistency with backend mappings and DTOs.

/** Add a dependency: taskId depends on dependsOnId */
export const addDependency = async (taskId: number, dependsOnId: number) => {
  const res = await api.post(`/tasks/${taskId}/dependencies`, { dependsOnId });
  return res.data; // returns DependencyDto
};

/** Remove a dependency (by dependency ID, not taskId) */
export const removeDependency = async (taskId: number, depId: number) => {
  await api.delete(`/tasks/${taskId}/dependencies/${depId}`);
};

/** List all dependencies (prerequisites) of a given task */
export const getDependencies = async (taskId: number) => {
  const res = await api.get(`/tasks/${taskId}/dependencies`);
  // Backend returns DependencyDto[], so normalize if only IDs are needed
  return res.data as DependencyDto[];
};

/** (Optional) List all dependents (tasks blocked by this task) */
export const getDependents = async (taskId: number) => {
  const res = await api.get(`/tasks/${taskId}/dependencies/dependents`);
  return res.data as DependencyDto[];
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

export const getProjectCollaborators = async (
  projectId: number
): Promise<ProjectCollaborator[]> => {
  const res = await api.get<ProjectCollaborator[]>(
    `/projects/${projectId}/collaboration/collaborators`
  );
  return res.data;
};

export const getProjectInvitations = async (
  projectId: number
): Promise<ProjectInvitation[]> => {
  const res = await api.get<ProjectInvitation[]>(
    `/projects/${projectId}/collaboration/invitations`
  );
  return res.data;
};

export const inviteUserToProject = async (
  projectId: number,
  request: InviteUserRequest
): Promise<ProjectInvitation> => {
  const res = await api.post<ProjectInvitation>(
    `/projects/${projectId}/collaboration/invite`,
    request
  );
  return res.data;
};

export const removeCollaborator = async (
  projectId: number,
  userId: number
): Promise<void> => {
  await api.delete(
    `/projects/${projectId}/collaboration/collaborators/${userId}`
  );
};

export const checkProjectAccess = async (
  projectId: number
): Promise<boolean> => {
  const res = await api.get<boolean>(
    `/projects/${projectId}/collaboration/check-access`
  );
  return res.data;
};

export const getUserInvitations = async (): Promise<ProjectInvitation[]> => {
  const res = await api.get<ProjectInvitation[]>("/invitations/my-invitations");
  return res.data;
};

export const acceptInvitation = async (
  invitationId: string
): Promise<ProjectCollaborator> => {
  const res = await api.post<ProjectCollaborator>(
    "/invitations/public/respond-by-id",
    {
      id: parseInt(invitationId),
      response: "accept",
    }
  );
  return res.data;
};

export const declineInvitation = async (
  invitationId: string
): Promise<void> => {
  await api.post("/invitations/public/respond-by-id", {
    id: parseInt(invitationId),
    response: "decline",
  });
};

// Project Activity/History API
export interface ProjectActivity {
  id: number;
  projectId: number;
  username: string;
  userEmail: string;
  activityType: string;
  entityType: string;
  entityId?: number;
  entityName?: string;
  action: string;
  description: string;
  oldValues?: string;
  newValues?: string;
  timestamp: string;
}

export const getProjectActivities = async (
  projectId: number
): Promise<ProjectActivity[]> => {
  const res = await api.get<ProjectActivity[]>(
    `/projects/${projectId}/activities`
  );
  return res.data;
};

export const getProjectActivitiesPaginated = async (
  projectId: number,
  page: number = 0,
  size: number = 20
): Promise<{ content: ProjectActivity[]; totalElements: number; totalPages: number }> => {
  const res = await api.get(
    `/projects/${projectId}/activities/paginated?page=${page}&size=${size}`
  );
  return res.data;
};

export const getRecentProjectActivities = async (
  projectId: number,
  limit: number = 10
): Promise<ProjectActivity[]> => {
  const res = await api.get<ProjectActivity[]>(
    `/projects/${projectId}/activities/recent?limit=${limit}`
  );
  return res.data;
};

export const getProjectActivitiesByDateRange = async (
  projectId: number,
  startDate: string,
  endDate: string
): Promise<ProjectActivity[]> => {
  const res = await api.get<ProjectActivity[]>(
    `/projects/${projectId}/activities/date-range?startDate=${startDate}&endDate=${endDate}`
  );
  return res.data;
};

export const getUserActivities = async (
  projectId: number,
  userId: number
): Promise<ProjectActivity[]> => {
  const res = await api.get<ProjectActivity[]>(
    `/projects/${projectId}/activities/user/${userId}`
  );
  return res.data;
};

export const getActivitiesByType = async (
  projectId: number,
  activityType: string
): Promise<ProjectActivity[]> => {
  const res = await api.get<ProjectActivity[]>(
    `/projects/${projectId}/activities/type/${activityType}`
  );
  return res.data;
};

export const getEntityActivities = async (
  projectId: number,
  entityType: string,
  entityId: number
): Promise<ProjectActivity[]> => {
  const res = await api.get<ProjectActivity[]>(
    `/projects/${projectId}/activities/entity/${entityType}/${entityId}`
  );
  return res.data;
};

export const getActivityStatistics = async (
  projectId: number
): Promise<Array<[string, number]>> => {
  const res = await api.get<Array<[string, number]>>(
    `/projects/${projectId}/activities/statistics`
  );
  return res.data;
};