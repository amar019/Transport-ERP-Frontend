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
