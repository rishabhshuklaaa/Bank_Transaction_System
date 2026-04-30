import axios from 'axios';

/**
 * --- Centralized Axios Instance ---
 * Handles all communication between the React frontend and Node.js backend.
 */
const API = axios.create({
    /**
     * baseURL:
     * - Production: Uses VITE_API_URL from Render Environment Variables.
     * - Local: Defaults to localhost:3000.
     */
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    
    /**
     * withCredentials:
     * Necessary for the browser to include JWT HttpOnly cookies in every request.
     */
    withCredentials: true,
    
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * --- Request Interceptor ---
 * Runs before every request is sent to the backend.
 * Useful if you decide to add dynamic headers in the future.
 */
API.interceptors.request.use(
    (config) => {
        // You can add logic here if needed before the request leaves
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * --- Response Interceptor ---
 * Monitors responses from the backend.
 */
API.interceptors.response.use(
    (response) => response,
    (error) => {
        /**
         * 401 Unauthorized: 
         * Means the JWT cookie is missing, expired, or invalid.
         */
        if (error.response && error.response.status === 401) {
            console.error("Session expired. Redirecting to login...");
            
            // Uncomment the line below to force redirect to login page
            // window.location.href = '/login'; 
        }

        /**
         * Network Error:
         * Occurs if the backend is down or the URL is incorrect.
         */
        if (!error.response) {
            console.error("Network Error: Please check if the backend server is running.");
        }

        return Promise.reject(error);
    }
);

export default API;