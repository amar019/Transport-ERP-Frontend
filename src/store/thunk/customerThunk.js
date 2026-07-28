import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    getCustomers,
    createCustomer,
    updateCustomer,
    deactivateCustomer,
} from "../../services/customer.service";

export const fetchCustomers = createAsyncThunk(
    "customers/fetchAll",
    async (params, { rejectWithValue }) => {
        try {
            const response = await getCustomers(params);
            // If response has { data: [...] }, return response.data, else return response
            return Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch customers"
            );
        }
    }
);

export const addCustomer = createAsyncThunk(
    "customers/add",
    async (customerData, { rejectWithValue, dispatch }) => {
        try {
            const response = await createCustomer(customerData);
            dispatch(fetchCustomers());
            return response.data || response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to create customer"
            );
        }
    }
);

export const editCustomer = createAsyncThunk(
    "customers/edit",
    async ({ id, customerData }, { rejectWithValue, dispatch }) => {
        try {
            const response = await updateCustomer(id, customerData);
            dispatch(fetchCustomers());
            return response.data || response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update customer"
            );
        }
    }
);

export const removeCustomer = createAsyncThunk(
    "customers/deactivate",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await deactivateCustomer(id);
            dispatch(fetchCustomers());
            return response.data || response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to deactivate customer"
            );
        }
    }
);
