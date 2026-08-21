import api from "./api";

/**
 * Get all branches (GET /api/branches)
 */
export const getBranches = async () => {
    const response = await api.get("/branches");
    return response.data;
};

/**
 * Get branch by ID (GET /api/branches/:id)
 */
export const getBranchById = async (branchId) => {
    const response = await api.get(`/branches/${branchId}`);
    return response.data;
};
