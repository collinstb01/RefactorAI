import axios from "axios";
import { getToken, removeToken } from "./token";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach bearer token to every request from localStorage
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

// Global error handler — log 401s, clear token, surface other errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("[api] Unauthorized — clearing token");
            removeToken();
        }
        return Promise.reject(error);
    }
);

export default api;
