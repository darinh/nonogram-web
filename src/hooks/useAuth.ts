import { useState, useEffect } from 'react';
import { useAuthProvider } from '../providers/useProviders';
import type { User } from '../engine/auth-types';

export function useAuth() {
  const authProvider = useAuthProvider();
  const [user, setUser] = useState<User | null>(authProvider.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return authProvider.onAuthChange(setUser);
  }, [authProvider]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      await authProvider.login(username, password);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      await authProvider.register(username, password, displayName);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authProvider.logout();
  };

  return { user, loading, login, register, logout };
}
