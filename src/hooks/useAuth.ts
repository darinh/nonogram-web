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

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await authProvider.loginWithGoogle();
    } finally {
      setLoading(false);
    }
  }, [authProvider]);

  const logout = async () => {
    await authProvider.logout();
  };

  return { user, loading, loginWithGoogle, logout };
}
