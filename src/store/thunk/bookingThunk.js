import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getBookings,
  getBookingById,
  createBooking as createBookingApi,
  updateBooking as updateBookingApi,
  cancelBooking as cancelBookingApi,
  deleteBooking as deleteBookingApi,
} from "../../services/booking.service";

export const fetchBookings = createAsyncThunk(
  "bookings/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getBookings(params);
      return Array.isArray(response)
        ? response
        : response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookings"
      );
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  "bookings/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getBookingById(id);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch booking details"
      );
    }
  }
);

export const addBooking = createAsyncThunk(
  "bookings/add",
  async (bookingData, { rejectWithValue, dispatch }) => {
    try {
      const response = await createBookingApi(bookingData);
      dispatch(fetchBookings());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create booking"
      );
    }
  }
);

export const editBooking = createAsyncThunk(
  "bookings/edit",
  async ({ id, bookingData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateBookingApi(id, bookingData);
      dispatch(fetchBookings());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update booking"
      );
    }
  }
);

export const cancelBookingThunk = createAsyncThunk(
  "bookings/cancel",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await cancelBookingApi(id);
      dispatch(fetchBookings());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  }
);

export const deleteBookingThunk = createAsyncThunk(
  "bookings/delete",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await deleteBookingApi(id);
      dispatch(fetchBookings());
      return { id, data: response.data || response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete booking"
      );
    }
  }
);
