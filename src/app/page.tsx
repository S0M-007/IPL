'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorative glow */}
      <div
        className="pointer-events-none absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-md animate-slide-up">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight gradient-text leading-tight">
            IPL Auction
            <br />
            Game
          </h1>
          <p className="mt-3 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Build your dream XI
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 gradient-border">
          {/* Inner content sits above the gradient-border pseudo-element */}
          <div className="relative z-10">
            {/* Google Sign-In */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 rounded-xl py-3 px-4 font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
              }}
            >
              <GoogleIcon />
              Sign in with Google
            </button>

            {/* OR Divider */}
            <div className="divider-or my-6">or</div>

            {/* Email / Password / Username Form */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-4"
            >
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-10"
                />
              </div>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-10"
                />
              </div>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Username (display name)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  className="input-dark pl-10"
                />
              </div>

              <button
                type="submit"
                className="btn-pill gradient-orange text-white text-sm animate-pulse-glow mt-2"
              >
                Sign In
              </button>
            </form>

            {/* Create Account Link */}
            <p
              className="text-center text-sm mt-6"
              style={{ color: 'var(--text-muted)' }}
            >
              Don&apos;t have an account?{' '}
              <Link
                href="#"
                className="font-medium hover:underline"
                style={{ color: 'var(--accent-cyan)' }}
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Inline Google "G" icon so we don't need an external asset */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
