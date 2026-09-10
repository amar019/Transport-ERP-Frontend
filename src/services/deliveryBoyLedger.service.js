import api from "./api";

/**
 * Fetch complete ledger entries for a delivery boy
 * GET /delivery-boy-ledger/:deliveryBoyId
 */
export const getDeliveryBoyLedger = async (deliveryBoyId) => {
  const response = await api.get(`/delivery-boy-ledger/${deliveryBoyId}`);
  return response.data;
};

/**
 * Fetch current balance for a delivery boy
 * GET /delivery-boy-ledger/:deliveryBoyId/balance
 */
export const getDeliveryBoyBalance = async (deliveryBoyId) => {
  const response = await api.get(`/delivery-boy-ledger/${deliveryBoyId}/balance`);
  return response.data;
};

/**
 * Record cash settlement from a delivery boy
 * POST /delivery-boy-ledger/:deliveryBoyId/settle
 * @param {string} deliveryBoyId
 * @param {Object} data - { amount, remarks }
 */
export const settleDeliveryBoyLedger = async (deliveryBoyId, data) => {
  const response = await api.post(`/delivery-boy-ledger/${deliveryBoyId}/settle`, data);
  return response.data;
};

/**
 * Fetch daily collection report for a delivery boy
 * GET /delivery-boy-ledger/:deliveryBoyId/daily-report?date=YYYY-MM-DD
 * @param {string} deliveryBoyId
 * @param {string} date - Format YYYY-MM-DD
 */
export const getDeliveryBoyDailyReport = async (deliveryBoyId, date) => {
  const response = await api.get(`/delivery-boy-ledger/${deliveryBoyId}/daily-report`, {
    params: { date },
  });
  return response.data;
};

/**
 * Fetch outstanding collections for a delivery boy (unsettled collections)
 * GET /delivery-boy-ledger/:deliveryBoyId/outstanding-collections
 */
export const getOutstandingCollections = async (deliveryBoyId) => {
  const response = await api.get(`/delivery-boy-ledger/${deliveryBoyId}/outstanding-collections`);
  return response.data;
};

/**
 * Bill-wise settlement for selected collection entries
 * POST /delivery-boy-ledger/:deliveryBoyId/settle-selected
 * @param {string} deliveryBoyId
 * @param {Object} data - { ledgerIds: string[], paymentMode: string, remarks: string }
 */
export const settleSelectedCollections = async (deliveryBoyId, data) => {
  const response = await api.post(`/delivery-boy-ledger/${deliveryBoyId}/settle-selected`, data);
  return response.data;
};


