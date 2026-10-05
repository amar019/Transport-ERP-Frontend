import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to automatically attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Helper function to force logout and clean up local storage
const forceLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTimestamp");

    // Dispatch event for Redux store listener
    window.dispatchEvent(new Event("auth:logout"));

    if (window.location.pathname !== "/login") {
        window.location.href = "/login?sessionExpired=true";
    }
};

// Response interceptor to automatically refresh token or logout after 1 hour session expiry
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isAuthRoute =
            originalRequest.url?.includes("/users/login") ||
            originalRequest.url?.includes("/users/refresh-token");

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                try {
                    const res = await axios.post(
                        `${import.meta.env.VITE_API_URL || ""}/users/refresh-token`,
                        { refreshToken },
                        { withCredentials: true }
                    );

                    const data = res.data?.data;
                    const newAccessToken = data?.accessToken || data?.token;
                    const newRefreshToken = data?.refreshToken;

                    if (newAccessToken) {
                        localStorage.setItem("token", newAccessToken);
                        if (newRefreshToken) {
                            localStorage.setItem("refreshToken", newRefreshToken);
                        }
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.warn("Session expired (1 hr reached) or refresh token invalid. Logging out.");
                    forceLogout();
                    return Promise.reject(refreshError);
                }
            } else {
                forceLogout();
            }
        }

        return Promise.reject(error);
    }
);

export default api;