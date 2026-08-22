import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getBookings,
  getBookingById,
  createBooking as createBookingApi,
  updateBooking as updateBookingApi,
  cancelBooking as cancelBookingApi,
  deleteBooking as deleteBookingApi,
} from "@/services/booking.service";

export const fetchBookings = createAsyncThunk(
  "bookings/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getBookings(params);
      return Array.isArray(response) ? response : response.data || [];
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

const initialState = {
  list: [],
  currentBooking: null,
  isLoading: false,
  actionLoading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Single
      .addCase(fetchBookingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addBooking.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentBooking = action.payload;
      })
      .addCase(addBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Edit
      .addCase(editBooking.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(editBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload?.data || action.payload;
        if (updated && (updated._id || updated.id)) {
          const targetId = updated._id || updated.id;
          state.currentBooking = updated;
          state.list = state.list.map((item) =>
            (item._id || item.id) === targetId ? { ...item, ...updated } : item
          );
        }
      })
      .addCase(editBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Cancel
      .addCase(cancelBookingThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelBookingThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        if (updated && (updated._id || updated.id)) {
          const targetId = updated._id || updated.id;
          state.list = state.list.map((item) =>
            (item._id || item.id) === targetId ? { ...item, ...updated, status: "CANCELLED" } : item
          );
          if (state.currentBooking && (state.currentBooking._id || state.currentBooking.id) === targetId) {
            state.currentBooking = { ...state.currentBooking, ...updated, status: "CANCELLED" };
          }
        }
      })
      .addCase(cancelBookingThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteBookingThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteBookingThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const deletedId = action.payload?.id;
        if (deletedId) {
          state.list = state.list.filter((item) => (item._id || item.id) !== deletedId);
          if (state.currentBooking && (state.currentBooking._id || state.currentBooking.id) === deletedId) {
            state.currentBooking = null;
          }
        }
      })
      .addCase(deleteBookingThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBookingError, clearCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
