import api from "../utils/api";
import requestHandler from "../utils/requestHandler";

const API = "/users";

export const signup = (payload) =>
    requestHandler(() => api.post(`${API}/signup`, payload));

export const login = (payload) =>
    requestHandler(() => api.post(`${API}/login`, payload));

export const getProfile = () =>
    requestHandler(() => api.get(`${API}/profile`));