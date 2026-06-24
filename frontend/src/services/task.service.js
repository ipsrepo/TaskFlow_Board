import api from "../utils/api";
import requestHandler from "../utils/requestHandler";

const API = "/tasks";

export const getTasks = (projectId, filters = {}) => {
    const params = new URLSearchParams(filters).toString();

    return requestHandler(() =>
        api.get(`${API}/project/${projectId}?${params}`)
    );
};

export const getMyTasks = (filters = {}) => {
    const params = new URLSearchParams(filters).toString();

    return requestHandler(() =>
        api.get(`${API}/my-tasks?${params}`)
    );
};

export const getKanban = (projectId) =>
    requestHandler(() =>
        api.get(`${API}/project/${projectId}/kanban`)
    );

export const createTask = (taskData) =>
    requestHandler(() =>
        api.post(API, taskData)
    );

export const updateTask = (id, taskData) =>
    requestHandler(() =>
        api.put(`${API}/${id}`, taskData)
    );

export const updateTaskStatus = (id, status) =>
    requestHandler(() =>
        api.patch(`${API}/${id}/status`, { status })
    );

export const deleteTask = (id) =>
    requestHandler(() =>
        api.delete(`${API}/${id}`)
    );

export const addComment = (taskId, text) =>
    requestHandler(() =>
        api.post(`${API}/${taskId}/comments`, { text })
    );