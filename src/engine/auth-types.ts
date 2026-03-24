export interface User {
  id: string;
  username: string;
  displayName: string;
}

export interface AuthChangeEvent {
  user: User | null;
}
