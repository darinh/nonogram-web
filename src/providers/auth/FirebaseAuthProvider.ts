import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth as _auth } from '../../firebase';
const auth = _auth!;
import type { User } from '../../engine/auth-types';
import type { AuthProvider } from './AuthProvider';

export class FirebaseAuthProvider implements AuthProvider {
  private googleProvider = new GoogleAuthProvider();

  private mapUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      username: firebaseUser.email || firebaseUser.uid,
      displayName: firebaseUser.displayName || firebaseUser.email || 'User',
    };
  }

  async loginWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, this.googleProvider);
    return this.mapUser(result.user);
  }

  async login(username: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, username, password);
    return this.mapUser(result.user);
  }

  async register(username: string, password: string, displayName?: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, username, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return this.mapUser(result.user);
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  getCurrentUser(): User | null {
    const user = auth.currentUser;
    return user ? this.mapUser(user) : null;
  }

  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? this.mapUser(firebaseUser) : null);
    });
  }
}
