import { createSlice } from "@reduxjs/toolkit";
import {
    fetchMemos,
    fetchMemoById,
    createMemoThunk,
    updateMemoThunk,
    deleteMemoThunk,
    markMemoOnRouteThunk,
    markMemoReceivedThunk,
    updateMemoCollectionThunk
} from "../thunk/memoThunk.js";

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
