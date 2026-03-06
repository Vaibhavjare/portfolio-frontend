import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("portfolio_token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem("portfolio_token", action.payload);
    },

    logout(state) {
      state.token = null;
      localStorage.removeItem("portfolio_token");
    },
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;