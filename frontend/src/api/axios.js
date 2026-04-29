import axios from 'axios';

/**
 * Centralized Axios configuration for the Bank Transaction System.
 * This instance handles all API calls to the Node.js backend.
 */
const API = axios.create({
    // Using Vite's environment variable for the backend URL
    // Make sure to define VITE_API_URL in your .env file
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    
    // CRITICAL: withCredentials must be true to send and receive JWT cookies
    // This allows the authMiddleware to verify the user session
    withCredentials: true,
    
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * Response Interceptor:
 * Useful for handling global errors like 401 (Unauthorized).
 * If the backend returns 401, it means the token is missing or invalid.
 */
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Logic to handle unauthorized access (e.g., redirect to login)
            console.error("Unauthorized! Redirecting to login...");
        }
        return Promise.reject(error);
    }
);

export default API;