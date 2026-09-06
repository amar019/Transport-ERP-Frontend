import api from "./api";

// 1. Get payments list
export const getPayments = async (params = {}) => {
    const response = await api.get("/payments", { params });
    return response.data;
};

// 2. Get payment summary metrics (Today Inflow, Today Outflow, Today Net Movement)
export const getPaymentSummary = async (params = {}) => {
    const response = await api.get("/payments/summary", { params });
    return response.data;
};

// 3. Get payment details by ID
export const getPaymentById = async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
};

// 4. Reverse payment transaction
export const reversePayment = async (id, reversalReason) => {
    const response = await api.post(`/payments/${id}/reverse`, { reversalReason });
    return response.data;
};

// 5. Record refund outflow
export const recordRefund = async (refundData) => {
    const response = await api.post("/payments/refund", refundData);
    return response.data;
};

// 6. Record Memo Settlement
export const recordMemoSettlement = async (memoId, settlementData) => {
    const response = await api.patch(`/memos/${memoId}/collection`, settlementData);
    return response.data;
};
