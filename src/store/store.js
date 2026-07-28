import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice.js";
import customersReducer from "./slice/customerSlice.js";

const store = configureStore({
    reducer: {
        auth: authReducer,
        customers: customersReducer,
    },
});

export default store;