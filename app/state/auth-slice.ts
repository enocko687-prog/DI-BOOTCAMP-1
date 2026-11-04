import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Member {
  id: string;
  name: string;
  email: string;
}

type AuthStatus = "checking" | "authenticated" | "anonymous" | "error";

interface AuthState {
  member: Member | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  member: null,
  status: "checking",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMember(state, action: PayloadAction<Member>) {
      state.member = action.payload;
      state.status = "authenticated";
    },
    setAnonymous(state) {
      state.member = null;
      state.status = "anonymous";
    },
    setAuthError(state) {
      state.member = null;
      state.status = "error";
    },
  },
});

export const { setMember, setAnonymous, setAuthError } = authSlice.actions;
export default authSlice.reducer;
