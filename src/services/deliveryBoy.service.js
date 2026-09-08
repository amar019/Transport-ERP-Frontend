import api from "./api";

/**
 * Get all delivery boys for logged-in user's branch
 * GET /delivery-boys
 */
export const getDeliveryBoys = async (params = {}) => {
  const response = await api.get("/delivery-boys", { params });
  return response.data;
};

/**
 * Get delivery boy by ID
 * GET /delivery-boys/:id
 */
export const getDeliveryBoyById = async (id) => {
  const response = await api.get(`/delivery-boys/${id}`);
  return response.data;
};

/**
 * Create a new delivery boy
 * POST /delivery-boys
 * @param {Object} data - { name, mobile }
 */
export const createDeliveryBoy = async (data) => {
  const response = await api.post("/delivery-boys", data);
  return response.data;
};

/**
 * Update delivery boy details
 * PATCH /delivery-boys/:id
 * @param {string} id
 * @param {Object} data - { name, mobile, status }
 */
export const updateDeliveryBoy = async (id, data) => {
  const response = await api.patch(`/delivery-boys/${id}`, data);
  return response.data;
};

/**
 * Deactivate a delivery boy
 * PATCH /delivery-boys/:id/deactivate
 * @param {string} id
 */
export const deactivateDeliveryBoy = async (id) => {
  const response = await api.patch(`/delivery-boys/${id}/deactivate`);
  return response.data;
};
