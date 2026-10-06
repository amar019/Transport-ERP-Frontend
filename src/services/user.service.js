import api from "./api";

/**
 * Register a new user account
 */
export const registerUser = async (userData) => {
  const response = await api.post("/users/register", userData);
  return response.data;
};

/**
 * Fetch all registered users
 */
export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export default {
  registerUser,
  getUsers,
};
