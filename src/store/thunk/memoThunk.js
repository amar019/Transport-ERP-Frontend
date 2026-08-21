import { createAsyncThunk } from "@reduxjs/toolkit";
import * as memoService from "../../services/memo.service.js";

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
