import api from "./api";

/**
 * Get all delivery bookings for the branch
 * GET /delivery/bookings
 * @param {Object} params - { status, search, startDate, endDate, paymentStatus }
 */
export const getDeliveryBookings = async (params = {}) => {
  const response = await api.get("/delivery/bookings", { params });
  return response.data;
};

/**
 * Get delivery booking details by ID
 * GET /delivery/bookings/:id
 * @param {string} id
 */
export const getDeliveryBookingById = async (id) => {
  const response = await api.get(`/delivery/bookings/${id}`);
  return response.data;
};

/**
 * Assign delivery boy to a booking
 * PATCH /delivery/bookings/:id/assign
 * @param {string} id
 * @param {string} deliveryBoyId
 */
export const assignDeliveryBoy = async (id, deliveryBoyId) => {
  const response = await api.patch(`/delivery/bookings/${id}/assign`, {
    deliveryBoyId,
  });
  return response.data;
};

/**
 * Counter delivery (direct pickup & collection at branch)
 * POST /delivery/bookings/:id/counter-delivery
 * @param {string} id
 * @param {Object} payload - { amount, paymentMode, remarks }
 */
export const counterDelivery = async (id, payload = {}) => {
  const response = await api.post(`/delivery/bookings/${id}/counter-delivery`, payload);
  return response.data;
};

/**
 * Mark booking as delivered
 * PATCH /delivery/bookings/:id/deliver
 * @param {string} id
 * @param {Object} payload - { remarks }
 */
export const markDelivered = async (id, payload = {}) => {
  const response = await api.patch(`/delivery/bookings/${id}/deliver`, payload);
  return response.data;
};

/**
 * Mark delivery as failed
 * PATCH /delivery/bookings/:id/failed
 * @param {string} id
 * @param {Object} payload - { remarks }
 */
export const markDeliveryFailed = async (id, payload = {}) => {
  const response = await api.patch(`/delivery/bookings/${id}/failed`, payload);
  return response.data;
};

/**
 * Collect customer payment for a delivery booking
 * POST /delivery/bookings/:id/collect-payment
 * @param {string} id
 * @param {Object} payload - { amount, collectedBy, paymentMode, remarks }
 */
export const collectCustomerPayment = async (id, payload = {}) => {
  const response = await api.post(`/delivery/bookings/${id}/collect-payment`, payload);
  return response.data;
};

export default {
  getDeliveryBookings,
  getDeliveryBookingById,
  assignDeliveryBoy,
  counterDelivery,
  markDelivered,
  markDeliveryFailed,
  collectCustomerPayment,
};
