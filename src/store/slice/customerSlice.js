import { createSlice } from "@reduxjs/toolkit";
import {
    fetchCustomers,
    addCustomer,
    editCustomer,
    removeCustomer,
} from "../thunk/customerThunk.js";

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
            .addCase(addCustomer.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Edit
            .addCase(editCustomer.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Deactivate
            .addCase(removeCustomer.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;
