import type { User } from '../../engine/auth-types';

export interface AuthProvider {
  loginWithGoogle(): Promise<User>;
  /** @deprecated Use loginWithGoogle(). Kept only for LocalStorage dev fallback. */
  login(username: string, password: string): Promise<User>;
  /** @deprecated Use loginWithGoogle(). */
  register(username: string, password: string, displayName?: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthChange(callback: (user: User | null) => void): () => void;
}
