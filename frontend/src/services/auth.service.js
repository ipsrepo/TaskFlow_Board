import api from "../utils/api";
import requestHandler from "../utils/requestHandler";

const API = "/users";

export const signup = (payload) =>
    requestHandler(() => api.post(`${API}/signup`, payload));

export const login = (payload) =>
    requestHandler(() => api.post(`${API}/login`, payload));

export const getAllUsers = () =>
    requestHandler(() => api.get(`${API}`));

export const deleteUser = (id) =>
    requestHandler(() => api.delete(`${API}/${id}`));

export const updateRole = (id, role) =>
    requestHandler(() =>
        api.put(`${API}/${id}/role`, {role})
    );
export const updateUser = (userData) =>
    requestHandler(() => api.put(`${API}/profile`, userData));

export const getProfile = () =>
    requestHandler(() => api.get(`${API}/profile`));