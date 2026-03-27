'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          IPL Auction Game
        </h1>
        <p className="text-gray-500 mt-2">Real-time multiplayer IPL auction simulator</p>
      </div>
      <LoginForm />
    </div>
  );
}
