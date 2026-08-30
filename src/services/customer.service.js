import api from "./api";

// 1. Create a new customer (POST /customers)
export const createCustomer = async (customerData) => {
    const response = await api.post("/customers", customerData);
    return response.data;
};

// 2. Get all customers (GET /customers)
export const getCustomers = async (params = {}) => {
    const response = await api.get("/customers", { params });
    return response.data;
};

// 3. Get customer by ID (GET /customers/:id)
export const getCustomerById = async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
};

// 4. Update customer (PATCH /customers/:id)
export const updateCustomer = async (id, customerData) => {
    const response = await api.patch(`/customers/${id}`, customerData);
    return response.data;
};

// 5. Deactivate customer (PATCH /customers/:id/deactivate)
export const deactivateCustomer = async (id) => {
    const response = await api.patch(`/customers/${id}/deactivate`);
    return response.data;
};

// 6. Activate customer (PATCH /customers/:id/activate)
export const activateCustomer = async (id) => {
    const response = await api.patch(`/customers/${id}/activate`);
    return response.data;
};

