import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Higher-Order Component to protect private routes.
 * It checks the global auth state before rendering the children.
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    // Show a loading state while checking the JWT session from cookies
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If no user is found in context, redirect to Login
    // We save the 'from' location to redirect the user back after they login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user is authenticated, render the requested component (Dashboard/Transfer etc.)
    return children;
};

export default ProtectedRoute;