import type { User } from '../../engine/auth-types';

export interface AuthProvider {
  login(username: string, password: string): Promise<User>;
  register(username: string, password: string, displayName?: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthChange(callback: (user: User | null) => void): () => void;
}
