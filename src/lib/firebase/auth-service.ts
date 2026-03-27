import { auth } from './client';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export async function getIdToken(): Promise<string | null> {
  return auth.currentUser?.getIdToken() ?? null;
}
