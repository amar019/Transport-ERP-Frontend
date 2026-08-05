import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice.js";
import customersReducer from "./slice/customerSlice.js";
import bookingsReducer from "./slice/bookingSlice.js";

const store = configureStore({
    reducer: {
        auth: authReducer,
        customers: customersReducer,
        bookings: bookingsReducer,
    },
});

export default store;