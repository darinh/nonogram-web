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

interface StoredUser extends User {
  passwordHash: string;
}

type UserRegistry = Record<string, StoredUser>;

function toPublicUser({ id, username, displayName }: StoredUser): User {
  return { id, username, displayName };
}

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
    try {
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  async register(username: string, password: string, displayName?: string): Promise<User> {
    const registry = this.getRegistry();
    if (registry[username]) {
      throw new Error('Username already taken');
    }

    const stored: StoredUser = {
      id: simpleHash(username),
      username,
      displayName: displayName || username,
      passwordHash: simpleHash(password),
    };

    registry[username] = stored;
    this.saveRegistry(registry);
    const user = toPublicUser(stored);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
    this.notifyListeners(user);
    return user;
  }

  async login(username: string, password: string): Promise<User> {
    const registry = this.getRegistry();
    const existing = registry[username];
    if (!existing) {
      throw new Error('User not found');
    }

    if (existing.passwordHash !== simpleHash(password)) {
      throw new Error('Invalid password');
    }

    const user = toPublicUser(existing);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
    this.notifyListeners(user);
    return user;
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
