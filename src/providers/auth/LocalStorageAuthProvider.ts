import type { User } from '../../engine/auth-types';
import type { AuthProvider } from './AuthProvider';

const STORAGE_KEY = 'nonogram_user';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
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

  async login(username: string, _password: string): Promise<User> {
    const user: User = {
      id: simpleHash(username),
      username,
      displayName: username,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
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
