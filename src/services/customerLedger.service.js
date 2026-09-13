import api from "./api";

/**
 * Fetch complete customer ledger entries
 * GET /customer-ledger/customer/:customerId
 */
export const getCustomerLedger = async (customerId) => {
  const response = await api.get(`/customer-ledger/customer/${customerId}`);
  return response.data;
};

/**
 * Fetch current balance for a customer
 * GET /customer-ledger/customer/:customerId/balance
 */
export const getCustomerBalance = async (customerId) => {
  const response = await api.get(`/customer-ledger/customer/${customerId}/balance`);
  return response.data;
};

/**
 * Fetch outstanding TO_PAY bookings for a customer
 * GET /customer-ledger/customer/:customerId/outstanding
 */
export const getCustomerOutstandingBookings = async (customerId) => {
  const response = await api.get(`/customer-ledger/customer/${customerId}/outstanding`);
  return response.data;
};

/**
 * Collect payment for customer outstanding bookings
 * POST /customer-ledger/customer/:customerId/collect-payment
 * @param {string} customerId
 * @param {Object} data - { payments: [{ bookingId, amount }], paymentMode, remarks }
 */
export const collectCustomerOutstandingPayment = async (customerId, data) => {
  const response = await api.post(`/customer-ledger/customer/${customerId}/collect-payment`, data);
  return response.data;
};

