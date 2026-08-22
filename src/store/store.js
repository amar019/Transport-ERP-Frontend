import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import customersReducer from "./slices/customerSlice";
import bookingsReducer from "./slices/bookingSlice";
import memoReducer from "./slices/memoSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customersReducer,
    bookings: bookingsReducer,
    memos: memoReducer,
  },
});

export default store;