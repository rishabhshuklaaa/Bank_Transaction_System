import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

// Creating the Auth Context to be used across the app
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Check if the user is already logged in on mount.
     * This calls the dashboard-data endpoint which is protected by authMiddleware.
     */
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // If this succeeds, the user is authenticated via cookies
                const { data } = await API.get('/user/dashboard-data');
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                // If it fails, user is not logged in; we don't need to do anything
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    /**
     * Handles User Login
     * POST /api/auth/login
     */
    const login = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            if (data.success) {
                setUser(data.user);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Login failed"
            };
        }
    };

    /**
     * Handles User Registration
     * POST /api/auth/register
     */
    const register = async (userData) => {
        try {
            const { data } = await API.post('/auth/register', userData);
            if (data.success) {
                setUser(data.user);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Registration failed"
            };
        }
    };

    /**
     * Handles User Logout
     * POST /api/auth/logout
     */
    const logout = async () => {
        try {
            await API.post('/auth/logout');
            setUser(null); // Clear local state
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};