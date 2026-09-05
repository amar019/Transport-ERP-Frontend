// Frontend/src/services/expense.service.js
import api from "./api";

// 1. Create a new expense
export const createExpense = async (expenseData) => {
    const response = await api.post("/expenses", expenseData);
    return response.data;
};

// 2. Get all expenses (with optional query filters: category, startDate, endDate)
export const getExpenses = async (params = {}) => {
    const response = await api.get("/expenses", { params });
    return response.data;
};

// 3. Get expense details by ID
export const getExpenseById = async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
};

// 4. Update an existing expense
export const updateExpense = async (id, expenseData) => {
    const response = await api.patch(`/expenses/${id}`, expenseData);
    return response.data;
};

// 5. Cancel an expense
export const cancelExpense = async (id) => {
    const response = await api.patch(`/expenses/${id}/cancel`);
    return response.data;
};
