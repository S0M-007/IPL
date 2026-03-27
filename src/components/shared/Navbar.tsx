'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { Menu, X, LogOut, Trophy } from 'lucide-react';

const navLinks = [
  { href: '/teams', label: 'Teams' },
  { href: '/players', label: 'Players' },
  { href: '/how-to-play', label: 'How to Play' },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Trophy className="w-5 h-5 text-indigo-400" />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              IPL Auction
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{user.displayName || user.email}</span>
                <button
                  onClick={signOut}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block py-2 text-sm font-medium',
                  pathname === link.href ? 'text-white' : 'text-gray-400'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-800">
              {user ? (
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="flex items-center gap-2 py-2 text-sm text-gray-400"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-indigo-400">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
