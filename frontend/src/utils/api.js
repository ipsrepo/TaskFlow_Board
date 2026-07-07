import axios from 'axios';
import {getToken, removeToken} from './tokenManager';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {'Content-Type': 'application/json'},
});

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url;

        const isAuthRequest =
            url?.includes("/login") || url?.includes("/signup");

        if (error.response?.status === 401 && !isAuthRequest) {
            removeToken();
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);
export default api;
