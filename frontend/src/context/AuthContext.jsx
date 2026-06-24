import {createContext, useState, useEffect, useCallback} from "react";
import * as authService from "../services/auth.service";

import {
    getToken,
    setToken,
    removeToken,
    getStoredUser,
    setStoredUser,
} from "../utils/tokenManager";

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(getStoredUser);
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

    const authenticate = useCallback(({ token, data }) => {
        setToken(token);
        setStoredUser(data.user);
        setUser(data.user);
    }, []);

    const login = useCallback(async (email, password) => {
        const response = await authService.login({ email, password });

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

    const logout = useCallback(() => {
        removeToken();
        setStoredUser(null);
        setUser(null);
    }, []);

    const updateUser = useCallback((updatedUser) => {
        setStoredUser(updatedUser);
        setUser(updatedUser);
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
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