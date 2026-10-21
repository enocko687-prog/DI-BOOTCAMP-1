import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthResponse, User } from "../../../../types";
import { apiRequest, refreshSession } from "../../app/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: "checking" | "idle" | "loading";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: "checking",
  error: null,
};

interface Credentials {
  email: string;
  password: string;
}

export const initializeSession = createAsyncThunk<AuthResponse, void, { rejectValue: string }>(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      return await refreshSession();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "No active session.");
    }
  },
);

export const loginUser = createAsyncThunk<AuthResponse, Credentials, { rejectValue: string }>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to sign in.");
    }
  },
);

export const registerUser = createAsyncThunk<
  AuthResponse,
  Credentials & { username: string },
  { rejectValue: string }
>(
  "auth/register",
  async (details, { rejectWithValue }) => {
    try {
      return await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(details),
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Unable to create account.");
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await apiRequest<void>("/auth/logout", { method: "POST" });
  } catch {
    // Clear in-memory credentials even if the API is unavailable.
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    clearSession(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(initializeSession.pending, (state) => {
        state.status = "checking";
      })
      .addCase(initializeSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = "idle";
        state.error = null;
      })
      .addCase(initializeSession.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "idle";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = "idle";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = "idle";
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Unable to sign in.";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Unable to create account.";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.error = null;
        state.status = "idle";
      });
  },
});

export const { clearSession, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
