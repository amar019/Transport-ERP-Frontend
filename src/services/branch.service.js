import api from "./api";

/**
 * 1. Create a new branch (POST /branches)
 */
export const createBranch = async (branchData) => {
  const response = await api.post("/branches", branchData);
  return response.data;
};

/**
 * 2. Get all branches (GET /branches)
 */
export const getBranches = async () => {
  const response = await api.get("/branches");
  return response.data;
};

/**
 * 3. Get branch by ID (GET /branches/:id)
 */
export const getBranchById = async (branchId) => {
  const response = await api.get(`/branches/${branchId}`);
  return response.data;
};

/**
 * 4. Update branch (PATCH /branches/:id)
 */
export const updateBranch = async (branchId, branchData) => {
  const response = await api.patch(`/branches/${branchId}`, branchData);
  return response.data;
};

/**
 * 5. Deactivate branch (PATCH /branches/:id/deactivate)
 */
export const deactivateBranch = async (branchId) => {
  const response = await api.patch(`/branches/${branchId}/deactivate`);
  return response.data;
};
