'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/lib/hooks/useAuth';

const NAV_LINKS = [
  { href: '/main', label: 'Main' },
  { href: '/teams', label: 'Teams' },
  { href: '/players', label: 'Players' },
  { href: '/how-to-play', label: 'How to Play' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      // Silently handle sign-out errors
    }
  }

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(10, 14, 26, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="text-xl font-extrabold tracking-tight gradient-text">
            IPL Auction
          </Link>

          {/* Center links */}
          <div className="hidden sm:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'text-sm font-medium transition-colors',
                    isActive
                      ? 'text-white'
                      : 'hover:text-white',
                  )}
                  style={isActive ? undefined : { color: 'var(--text-muted)' }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User area */}
          {loading ? (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
              />
            </div>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xs font-bold" style={{ color: 'var(--accent-orange)' }}>
                    {(user.displayName || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div
                  className="absolute right-0 top-11 w-48 rounded-xl p-2 shadow-xl z-50"
                  style={{
                    background: 'rgba(20, 24, 40, 0.95)',
                    border: '1px solid var(--glass-border)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <p className="px-3 py-2 text-sm font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                    {user.displayName || 'Player'}
                  </p>
                  <p className="px-3 pb-2 text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {user.email}
                  </p>
                  <hr style={{ borderColor: 'var(--glass-border)' }} />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-white/5 mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/"
              className="text-sm font-medium flex items-center gap-2 transition-colors hover:text-white"
              style={{ color: 'var(--text-muted)' }}
            >
              <User size={16} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
