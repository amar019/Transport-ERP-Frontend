import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getCustomers,
    createCustomer,
    updateCustomer,
    deactivateCustomer,
} from "../../services/customer.service";

// 1. Fetch all customers
export const fetchCustomers = createAsyncThunk(
    "customers/fetchAll",
    async (params, { rejectWithValue }) => {
        try {
            const response = await getCustomers(params);
            return response.data || response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch customers"
            );
        }
    }
);

// 2. Create customer
export const addCustomer = createAsyncThunk(
    "customers/add",
    async (customerData, { rejectWithValue, dispatch }) => {
        try {
            const response = await createCustomer(customerData);
            dispatch(fetchCustomers()); // refresh list
            return response.data || response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to create customer"
            );
        }
    }
);

// 3. Update customer
export const editCustomer = createAsyncThunk(
    "customers/edit",
    async ({ id, customerData }, { rejectWithValue, dispatch }) => {
        try {
            const response = await updateCustomer(id, customerData);
            dispatch(fetchCustomers()); // refresh list
            return response.data || response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update customer"
            );
        }
    }
);

// 4. Deactivate customer
export const removeCustomer = createAsyncThunk(
    "customers/deactivate",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await deactivateCustomer(id);
            dispatch(fetchCustomers()); // refresh list
            return response.data || response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to deactivate customer"
            );
        }
    }
);

const customerSlice = createSlice({
    name: "customers",
    initialState: {
        list: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        clearCustomerError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCustomers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.list = action.payload;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Add
            .addCase(addCustomer.pending, (state) => {
                state.error = null;
            })
            .addCase(addCustomer.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Edit
            .addCase(editCustomer.pending, (state) => {
                state.error = null;
            })
            .addCase(editCustomer.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Deactivate
            .addCase(removeCustomer.pending, (state) => {
                state.error = null;
            })
            .addCase(removeCustomer.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearCustomerError } = customerSlice.actions;

export default customerSlice.reducer;
