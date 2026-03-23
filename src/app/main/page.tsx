'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gavel, Sparkles, Crown, Trophy, ChevronRight } from 'lucide-react';

const MODES = [
  {
    key: 'regular',
    label: 'Regular IPL Auction',
    desc: 'Classic mega-auction with 2026 player pool, salary caps, and team slots — just like the real thing.',
    icon: Gavel,
    accent: 'orange' as const,
  },
  {
    key: 'fantasy',
    label: 'Fantasy IPL Auction',
    desc: 'Draft your fantasy XI from the current season rosters and compete on a points table.',
    icon: Sparkles,
    accent: 'cyan' as const,
  },
  {
    key: 'alltime',
    label: 'All-Time IPL Auction',
    desc: 'Legends mode — bid on every star who has ever played IPL, across all seasons.',
    icon: Crown,
    accent: 'purple' as const,
  },
] as const;

const accentStyles = {
  orange: {
    border: 'mode-card-orange',
    glow: 'glow-orange',
    gradient: 'gradient-text',
    iconColor: 'var(--accent-orange)',
  },
  cyan: {
    border: 'mode-card-cyan',
    glow: 'glow-cyan',
    gradient: 'gradient-text-cyan',
    iconColor: 'var(--accent-cyan)',
  },
  purple: {
    border: 'mode-card-purple',
    glow: 'glow-purple',
    gradient: 'gradient-text-purple',
    iconColor: 'var(--purple)',
  },
};

export default function MainMenuPage() {
  const router = useRouter();
  const userName = 'Player'; // placeholder

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Welcome */}
      <div className="mb-10 animate-fade-in">
        <p className="text-sm uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Welcome back
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mt-1 tracking-tight">
          Hey,{' '}
          <span className="gradient-text">{userName}</span>
        </h1>
      </div>

      {/* Mode Cards */}
      <section className="flex flex-col gap-5 mb-14">
        {MODES.map((mode, i) => {
          const style = accentStyles[mode.accent];
          const Icon = mode.icon;
          return (
            <button
              key={mode.key}
              onClick={() => router.push(`/league/create?mode=${mode.key}`)}
              className={`glass-card ${style.border} p-6 text-left flex items-start gap-5 transition-all duration-200 hover:scale-[1.02] hover:${style.glow} animate-slide-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <Icon size={24} style={{ color: style.iconColor }} />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className={`text-lg font-bold ${style.gradient}`}>
                  {mode.label}
                </h2>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {mode.desc}
                </p>
              </div>

              <ChevronRight
                size={20}
                className="shrink-0 mt-1"
                style={{ color: 'var(--text-muted)' }}
              />
            </button>
          );
        })}
      </section>

      {/* Your Leagues & Leaderboard */}
      <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Your Leagues</h2>
          <Link
            href="/leaderboard"
            className="text-sm font-medium flex items-center gap-1 transition-colors"
            style={{ color: 'var(--accent-cyan)' }}
          >
            <Trophy size={14} />
            Leaderboard
          </Link>
        </div>

        {/* Empty state */}
        <div
          className="glass-card p-8 text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          {/* Decorative cricket ball */}
          <CricketBall />
          <p className="mt-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
            No leagues yet
          </p>
          <p className="text-sm mt-1">
            Pick a mode above to start your first auction
          </p>
        </div>
      </section>
    </div>
  );
}

/* Simple CSS cricket-ball shape */
function CricketBall() {
  return (
    <div className="mx-auto w-14 h-14 rounded-full relative" style={{
      background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
      boxShadow: '0 0 20px rgba(231,76,60,0.25)',
    }}>
      {/* Seam line */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-10 h-10 rounded-full border-2 border-dashed"
          style={{ borderColor: 'rgba(255,255,255,0.35)' }}
        />
      </div>
    </div>
  );
}
