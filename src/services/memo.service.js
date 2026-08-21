import api from "./api";

/**
 * 1. Create a new Memo (POST /api/memos)
 * @param {Object} memoData - { toBranch, bookings, notes }
 */
export const createMemo = async (memoData) => {
    const response = await api.post("/memos", memoData);
    return response.data;
};

/**
 * 2. Get all memos (GET /api/memos)
 * @param {Object} params - Query params (status, collectionStatus, search)
 */
export const getMemos = async (params = {}) => {
    const response = await api.get("/memos", { params });
    return response.data;
};

/**
 * 3. Get memo details by ID (GET /api/memos/:id)
 * @param {string} id
 */
export const getMemoById = async (id) => {
    const response = await api.get(`/memos/${id}`);
    return response.data;
};

/**
 * 4. Update draft memo (PATCH /api/memos/:id)
 * @param {string} id
 * @param {Object} memoData
 */
export const updateMemo = async (id, memoData) => {
    const response = await api.patch(`/memos/${id}`, memoData);
    return response.data;
};

/**
 * 5. Delete draft memo (DELETE /api/memos/:id)
 * @param {string} id
 */
export const deleteMemo = async (id) => {
    const response = await api.delete(`/memos/${id}`);
    return response.data;
};

/**
 * 6. Mark memo as On Route / Dispatched (PATCH /api/memos/:id/on-route)
 * @param {string} id
 */
export const markMemoOnRoute = async (id) => {
    const response = await api.patch(`/memos/${id}/on-route`);
    return response.data;
};

/**
 * 7. Mark memo as Received by destination branch (PATCH /api/memos/:id/received)
 * @param {string} id
 */
export const markMemoReceived = async (id) => {
    const response = await api.patch(`/memos/${id}/received`);
    return response.data;
};

/**
 * 8. Record memo collection / settlement payment (PATCH /api/memos/:id/collection)
 * @param {string} id
 * @param {number} amountReceived
 */
export const updateMemoCollection = async (id, amountReceived) => {
    const response = await api.patch(`/memos/${id}/collection`, {
        amountReceived: Number(amountReceived),
    });
    return response.data;
};
