import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { AuthContext } from './AuthContext';
import { tokenStorage } from './tokenStorage';
import type { User } from '../types/api';

// Keeps the logged-in user for the whole app
export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  // Only "loading" if there is a saved token to check
  const [loading, setLoading] = useState(() => tokenStorage.getAccessToken() !== null);

  // When the page opens, if we have a token, load the user from /users/me
  useEffect(() => {
    if (!tokenStorage.getAccessToken()) {
      return;
    }
    authApi
      .getMe()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const auth = await authApi.login(email, password);
    tokenStorage.save(auth.accessToken, auth.refreshToken);
    setUser(auth.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Even if the server call fails, we still log out on this browser
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  // useMemo: only give a new value to the context when something really changes
  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}