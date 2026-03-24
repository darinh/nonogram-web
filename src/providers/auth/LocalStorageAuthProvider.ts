import type { User } from '../../engine/auth-types';
import type { AuthProvider } from './AuthProvider';

const STORAGE_KEY = 'nonogram_user';
const REGISTRY_KEY = 'nonogram_users';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

type UserRegistry = Record<string, User>;

export class LocalStorageAuthProvider implements AuthProvider {
  private listeners: Array<(user: User | null) => void> = [];

  constructor() {
    window.addEventListener('storage', this.handleStorageEvent);
  }

  private handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      const user = e.newValue ? JSON.parse(e.newValue) as User : null;
      this.notifyListeners(user);
    }
  };

  private notifyListeners(user: User | null): void {
    for (const cb of this.listeners) {
      cb(user);
    }
  }

  private getRegistry(): UserRegistry {
    try {
      const data = localStorage.getItem(REGISTRY_KEY);
      return data ? JSON.parse(data) as UserRegistry : {};
    } catch {
      return {};
    }
  }

  private saveRegistry(registry: UserRegistry): void {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  }

  async register(username: string, _password: string, displayName?: string): Promise<User> {
    const registry = this.getRegistry();
    if (registry[username]) {
      throw new Error('Username already taken');
    }

    const user: User = {
      id: simpleHash(username),
      username,
      displayName: displayName || username,
    };

    registry[username] = user;
    this.saveRegistry(registry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.notifyListeners(user);
    return user;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(username: string, _password: string): Promise<User> {
    const registry = this.getRegistry();
    const existing = registry[username];
    if (!existing) {
      throw new Error('User not found');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    this.notifyListeners(existing);
    return existing;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    this.notifyListeners(null);
  }

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) as User : null;
    } catch {
      return null;
    }
  }

  onAuthChange(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
}
