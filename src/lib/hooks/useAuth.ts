'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange } from '../firebase/auth';
import {
  signInWithGoogle as googleSignIn,
  signInWithEmail as emailSignIn,
  createAccount as createAcct,
  signOut as doSignOut,
  type AuthResult,
} from '../firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    return googleSignIn();
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      return emailSignIn(email, password);
    },
    [],
  );

  const createAccount = useCallback(
    async (email: string, password: string, displayName: string): Promise<AuthResult> => {
      return createAcct(email, password, displayName);
    },
    [],
  );

  const signOut = useCallback(async (): Promise<void> => {
    await doSignOut();
  }, []);

  return { user, loading, signInWithGoogle, signInWithEmail, createAccount, signOut };
}
