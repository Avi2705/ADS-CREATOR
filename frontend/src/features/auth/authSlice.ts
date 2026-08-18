import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  role: 'EXPLORER' | 'B2C' | 'B2B' | 'SUPER_ADMIN';
  firstName?: string;
  lastName?: string;
  mobile?: string;
  companyName?: string;
  tenantId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Load initial state from localStorage if available
const storedUser = localStorage.getItem('auth_user');
const storedToken = localStorage.getItem('auth_token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      localStorage.setItem('auth_token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
// Support both casings to prevent compile errors in other files
export const logOut = logout;
export default authSlice.reducer;
