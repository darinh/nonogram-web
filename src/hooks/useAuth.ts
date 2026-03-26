import { useState, useEffect, useCallback } from 'react';
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

  const loginWithGoogle = useCallback(async () => {
    if (!authProvider.loginWithGoogle) {
      throw new Error('Google sign-in is not supported by this auth provider');
    }
    setLoading(true);
    try {
      await authProvider.loginWithGoogle();
    } finally {
      setLoading(false);
    }
  }, [authProvider]);

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

  const supportsGoogle = !!authProvider.loginWithGoogle;

  return { user, loading, login, loginWithGoogle, register, logout, supportsGoogle };
}
