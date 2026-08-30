import api from "./api";

export const loginUser = async (credentials) => {
    const response = await api.post("/users/login", credentials);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/users/me");
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await api.patch("/users/change-password", passwordData);
    return response.data;
};

export const updateUserProfile = async (userData) => {
    const response = await api.patch("/users/update-profile", userData);
    return response.data;
};

export const logoutUser = async () => {
    const response = await api.post("/users/logout");
    return response.data;
};