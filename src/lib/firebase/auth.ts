import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './config';

export type AuthResult =
  | { success: true; user: User }
  | { success: false; error: string };

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Google sign-in failed';
    return { success: false, error: message };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Email sign-in failed';
    return { success: false, error: message };
  }
}

export async function createAccount(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthResult> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    return { success: true, user: result.user };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Account creation failed';
    return { success: false, error: message };
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
