import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser } from "@/services/auth.service";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginUser(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// Retrieve saved session safely
const savedToken = localStorage.getItem("token");
const savedRefreshToken = localStorage.getItem("refreshToken");
let savedUser = null;
try {
  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    savedUser = JSON.parse(rawUser);
  }
} catch (e) {
  console.error("Failed to parse saved user from localStorage", e);
}

const initialState = {
  user: savedUser,
  token: savedToken || null,
  refreshToken: savedRefreshToken || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!savedToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, token, refreshToken, user } = action.payload;
      const newToken = accessToken || token;
      if (newToken) {
        state.token = newToken;
        localStorage.setItem("token", newToken);
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
        localStorage.setItem("refreshToken", refreshToken);
      }
      if (user) {
        state.user = user;
        localStorage.setItem("user", JSON.stringify(user));
      }
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("loginTimestamp");
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
        const token = action.payload.accessToken || action.payload.token;
        const refreshToken = action.payload.refreshToken;
        state.token = token;
        state.refreshToken = refreshToken || null;
        state.user = action.payload.user;
        if (token) {
          localStorage.setItem("token", token);
        }
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        if (action.payload.user) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
        localStorage.setItem("loginTimestamp", Date.now().toString());
        state.isAuthenticated = true;
        state.error = null;
      })
      // Login Failed
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("loginTimestamp");
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
