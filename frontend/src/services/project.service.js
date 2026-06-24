import api from "../utils/api";
import requestHandler from "../utils/requestHandler";

const API = "/projects";

export const getProjects = () =>
    requestHandler(() => api.get(API));

export const getProject = (id) =>
    requestHandler(() => api.get(`${API}/${id}`));

export const createProject = (projectData) =>
    requestHandler(() => api.post(API, projectData));

export const updateProject = (id, projectData) =>
    requestHandler(() => api.put(`${API}/${id}`, projectData));

export const deleteProject = (id) =>
    requestHandler(() => api.delete(`${API}/${id}`));

export const addMember = (projectId, userId) =>
    requestHandler(() =>
        api.post(`${API}/${projectId}/members`, { userId })
    );

export const removeMember = (projectId, userId) =>
    requestHandler(() =>
        api.delete(`${API}/${projectId}/members/${userId}`)
    );