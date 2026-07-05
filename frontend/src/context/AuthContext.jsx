import {createContext, useState, useEffect, useCallback} from "react";
import * as authService from "../services/auth.service";

import {
    getToken,
    setToken,
    removeToken,
    getStoredUser,
    setStoredUser,
} from "../utils/tokenManager";
import * as projectService from "../services/project.service.js";
import {updateRole} from "../services/auth.service";

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(getStoredUser);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(Boolean(getToken()));

    useEffect(() => {
        const initializeAuth = async () => {
            const token = getToken();

            if (!token) {
                setLoading(false);
                return;
            }

            const response = await authService.getProfile();

            if (response.success) {
                const currentUser = response.user;

                setUser(currentUser);
                setStoredUser(currentUser);
            } else {
                removeToken();
                setStoredUser(null);
                setUser(null);
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    const authenticate = useCallback(({token, data}) => {
        setToken(token);
        setStoredUser(data.user);
        setUser(data.user);
    }, []);

    const login = useCallback(async (email, password) => {
        const response = await authService.login({email, password});

        if (response.success) {
            authenticate(response);
        }

        return response;
    }, [authenticate]);

    const register = useCallback(async (name, email, password) => {
        const response = await authService.signup({
            name,
            email,
            password,
            passwordConfirm: password,
        });

        if (response.success) {
            authenticate(response);
        }

        return response;
    }, [authenticate]);

    const getAllUsers = useCallback(async () => {
        const response = await authService.getAllUsers();
        if (response?.success) setAllUsers(response.data);
    }, []);

    const deleteUser = useCallback(async (id) => {
        const response = await authService.deleteUser(id);
        if (response?.success) return response.success;
    }, []);

    const updateRole = useCallback(async (id, role) => {
        const response = await authService.updateRole(id, role);
        if (response?.success) return response;
    }, []);

    const logout = useCallback(() => {
        removeToken();
        setStoredUser(null);
        setUser(null);
    }, []);

    const updateUser = useCallback(async (userData) => {
        const response = await authService.updateUser(userData);
        if (response?.success) {
            setStoredUser(response?.data);
            setUser(response?.data);
        }
    }, []);

    const value = {
        user,
        allUsers,
        loading,
        isAuthenticated: Boolean(user),
        getAllUsers,
        updateRole,
        deleteUser,
        login,
        register,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};