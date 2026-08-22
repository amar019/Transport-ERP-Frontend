import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as memoService from "@/services/memo.service";

/**
 * Fetch All Memos
 */
export const fetchMemos = createAsyncThunk(
  "memos/fetchMemos",
  async (params, { rejectWithValue }) => {
    try {
      const response = await memoService.getMemos(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch memos"
      );
    }
  }
);

/**
 * Fetch Memo By ID
 */
export const fetchMemoById = createAsyncThunk(
  "memos/fetchMemoById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await memoService.getMemoById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch memo details"
      );
    }
  }
);

/**
 * Create Memo
 */
export const createMemoThunk = createAsyncThunk(
  "memos/createMemo",
  async (memoData, { rejectWithValue }) => {
    try {
      const response = await memoService.createMemo(memoData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create memo"
      );
    }
  }
);

/**
 * Update Memo
 */
export const updateMemoThunk = createAsyncThunk(
  "memos/updateMemo",
  async ({ id, memoData }, { rejectWithValue }) => {
    try {
      const response = await memoService.updateMemo(id, memoData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update memo"
      );
    }
  }
);

/**
 * Delete Memo
 */
export const deleteMemoThunk = createAsyncThunk(
  "memos/deleteMemo",
  async (id, { rejectWithValue }) => {
    try {
      await memoService.deleteMemo(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete memo"
      );
    }
  }
);

/**
 * Mark Memo On Route / Dispatch
 */
export const markMemoOnRouteThunk = createAsyncThunk(
  "memos/markOnRoute",
  async (id, { rejectWithValue }) => {
    try {
      const response = await memoService.markMemoOnRoute(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to dispatch memo"
      );
    }
  }
);

/**
 * Mark Memo Received
 */
export const markMemoReceivedThunk = createAsyncThunk(
  "memos/markReceived",
  async (id, { rejectWithValue }) => {
    try {
      const response = await memoService.markMemoReceived(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark memo as received"
      );
    }
  }
);

/**
 * Record Memo Collection / Settlement
 */
export const updateMemoCollectionThunk = createAsyncThunk(
  "memos/updateCollection",
  async ({ id, amountReceived }, { rejectWithValue }) => {
    try {
      const response = await memoService.updateMemoCollection(id, amountReceived);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to record collection settlement"
      );
    }
  }
);

const initialState = {
  list: [],
  currentMemo: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const memoSlice = createSlice({
  name: "memos",
  initialState,
  reducers: {
    clearCurrentMemo: (state) => {
      state.currentMemo = null;
    },
    clearMemoError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Memos
      .addCase(fetchMemos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchMemos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Memo By ID
      .addCase(fetchMemoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMemo = action.payload;
      })
      .addCase(fetchMemoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Memo
      .addCase(createMemoThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createMemoThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload) {
          state.list.unshift(action.payload);
        }
      })
      .addCase(createMemoThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Update Memo
      .addCase(updateMemoThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateMemoThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentMemo = action.payload;
        const index = state.list.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateMemoThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Delete Memo
      .addCase(deleteMemoThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteMemoThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.list = state.list.filter((m) => m._id !== action.payload);
        if (state.currentMemo?._id === action.payload) {
          state.currentMemo = null;
        }
      })
      .addCase(deleteMemoThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Mark On Route
      .addCase(markMemoOnRouteThunk.fulfilled, (state, action) => {
        if (state.currentMemo?._id === action.payload._id) {
          state.currentMemo = action.payload;
        }
        const index = state.list.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // Mark Received
      .addCase(markMemoReceivedThunk.fulfilled, (state, action) => {
        if (state.currentMemo?._id === action.payload._id) {
          state.currentMemo = action.payload;
        }
        const index = state.list.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // Update Collection
      .addCase(updateMemoCollectionThunk.fulfilled, (state, action) => {
        if (state.currentMemo?._id === action.payload._id) {
          state.currentMemo = action.payload;
        }
        const index = state.list.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export const { clearCurrentMemo, clearMemoError } = memoSlice.actions;
export default memoSlice.reducer;
