import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id?: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ email: string; name?: string; role?: string; id?: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = {
        id: action.payload.id,
        name: action.payload.name ?? 'Admin User',
        email: action.payload.email,
        role: action.payload.role ?? 'admin',
      };
    },
    restoreSession: (
      state,
      action: PayloadAction<{ email?: string; role?: string } | undefined>
    ) => {
      state.isAuthenticated = true;
      state.user = {
        name: 'Admin User',
        email: action.payload?.email ?? 'admin@tailored.com',
        role: action.payload?.role ?? 'admin',
      };
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { loginSuccess, restoreSession, logout } = authSlice.actions;
export default authSlice.reducer;
