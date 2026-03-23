'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import clsx from 'clsx';

const NAV_LINKS = [
  { href: '/main', label: 'Main' },
  { href: '/teams', label: 'Teams' },
  { href: '/players', label: 'Players' },
  { href: '/how-to-play', label: 'How to Play' },
];

export function Navbar() {
  const pathname = usePathname();

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

          {/* User avatar placeholder */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <User size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>
    </nav>
  );
}
