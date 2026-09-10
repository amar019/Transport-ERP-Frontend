import api from "./api";

/**
 * Get payment transactions with optional filters
 * GET /payment-transactions
 * @param {Object} params - { type, collectedBy, deliveryBoyId, customerId, bookingId }
 */
export const getPaymentTransactions = async (params = {}) => {
  const response = await api.get("/payment-transactions", { params });
  return response.data;
};

/**
 * Collect customer payment for a booking
 * POST /payment-transactions/collect/:id
 * @param {string} bookingId
 * @param {Object} data - { amount, collectedBy, paymentMode, remarks }
 */
export const collectCustomerPayment = async (bookingId, data) => {
  const response = await api.post(`/payment-transactions/collect/${bookingId}`, data);
  return response.data;
};
