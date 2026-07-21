import { createSlice } from "@reduxjs/toolkit";
import { login } from "../thunk/authThunk.js";

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // Login Pending
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })

            // Login Success
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;

                state.token = action.payload.token;
                state.user = action.payload.user;

                state.isAuthenticated = true;
                state.error = null;
            })

            // Login Failed
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            });
    },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;