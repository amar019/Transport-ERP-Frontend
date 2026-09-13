import api from "./api";

/**
 * Get delivery branch dashboard statistics and activity metrics
 * GET /dashboard/delivery
 * @param {Object} params - { period, selectedMonth }
 */
export const getDeliveryDashboard = async (params = {}) => {
  const response = await api.get("/dashboard/delivery", { params });
  return response.data;
};

export default {
  getDeliveryDashboard,
};
