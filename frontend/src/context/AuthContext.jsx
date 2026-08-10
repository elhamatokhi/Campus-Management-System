/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, loginUser, registerUser } from '../api/userApi.js';

const AuthContext = createContext(null);
const storageKey = 'campusEventsAuth';

function readStoredAuth() {
  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredAuth()?.token || '');
  const [user, setUser] = useState(() => readStoredAuth()?.user || null);
  const [isInitializing, setIsInitializing] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setIsInitializing(false);
      return;
    }

    getProfile(token)
      .then((response) => {
        setUser(response.data);
        window.localStorage.setItem(storageKey, JSON.stringify({ token, user: response.data }));
      })
      .catch(() => {
        setToken('');
        setUser(null);
        window.localStorage.removeItem(storageKey);
      })
      .finally(() => setIsInitializing(false));
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'ADMIN',
      isInitializing,
      async login(credentials) {
        const response = await loginUser(credentials);
        setToken(response.data.token);
        setUser(response.data.user);
        window.localStorage.setItem(storageKey, JSON.stringify(response.data));
        return response.data;
      },
      async register(payload) {
        return registerUser(payload);
      },
      logout() {
        setToken('');
        setUser(null);
        window.localStorage.removeItem(storageKey);
      },
      setUser,
    }),
    [isInitializing, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
