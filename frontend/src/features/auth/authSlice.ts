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

// Load initial state from localStorage if available with full customerType and subscription sync
const getInitialUser = (): any => {
  const storedUser = localStorage.getItem('auth_user');
  if (!storedUser) return null;
  try {
    const parsed = JSON.parse(storedUser);
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const local = mockUsers.find((u: any) => u.email?.toLowerCase() === parsed.email?.toLowerCase());

    // Check all_b2c_requests for active B2C client requests
    let hasB2C = false;
    try {
      const allReqs = JSON.parse(localStorage.getItem('all_b2c_requests') || '[]');
      hasB2C = allReqs.some((r: any) => 
        (r.userEmail && r.userEmail.toLowerCase() === parsed.email?.toLowerCase()) || 
        r.userId === parsed.id || r.userId === parsed._id || (local && r.userId === local._id)
      );
    } catch (e) {}

    let cType = local?.customerType || parsed.customerType || (hasB2C ? 'B2C' : 'EXPLORER');
    let sub = local?.subscription || parsed.subscription;
    if (sub) {
      const subLower = sub.toLowerCase();
      if (subLower.includes('starter') || subLower.includes('growth') || subLower.includes('scale') || subLower.includes('b2b')) {
        cType = 'B2B';
      } else {
        cType = 'B2C';
      }
    } else if (hasB2C && cType === 'EXPLORER') {
      cType = 'B2C';
    }

    return {
      ...parsed,
      ...(local || {}),
      customerType: cType,
      accountType: cType,
      role: cType === 'B2B' ? 'BUSINESS_OWNER' : (parsed.role === 'SUPER_ADMIN' || local?.role === 'SUPER_ADMIN') ? 'SUPER_ADMIN' : 'CUSTOMER',
      subscription: sub,
      paymentStatus: (local?.paymentStatus || parsed.paymentStatus) || (sub ? 'PAID' : 'PENDING'),
      freeAdGenerated: true,
      freeAdsUsed: 1
    };
  } catch (e) {
    return null;
  }
};

const storedToken = localStorage.getItem('auth_token');

const initialState: AuthState = {
  user: getInitialUser(),
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
