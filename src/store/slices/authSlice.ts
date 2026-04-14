import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  username: string | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  roles: string[];
}

function loadAuthState(): AuthState {
  try {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...parsed, isAuthenticated: !!parsed.token };
    }
  } catch { /* ignore */ }
  return {
    isAuthenticated: false,
    token: null,
    userId: null,
    username: null,
    email: null,
    displayName: null,
    avatarUrl: null,
    roles: [],
  };
}

function saveAuthState(state: AuthState) {
  try {
    localStorage.setItem('auth', JSON.stringify(state));
  } catch { /* ignore */ }
}

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      token: string;
      userId: string;
      username: string;
      email: string;
      displayName: string;
      avatarUrl?: string;
      roles: string[];
    }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName;
      state.avatarUrl = action.payload.avatarUrl ?? null;
      state.roles = action.payload.roles;
      saveAuthState(state);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.userId = null;
      state.username = null;
      state.email = null;
      state.displayName = null;
      state.avatarUrl = null;
      state.roles = [];
      saveAuthState(state);
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
});

export const { setCredentials, logout, updateToken } = authSlice.actions;
export default authSlice.reducer;
