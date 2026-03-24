'use client';

import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import {
  Pause,
  Square,
  Wifi,
  ChevronRight,
  Gavel,
  MessageSquare,
  Activity,
  Send,
  Trophy,
  Users,
  Globe,
  Wallet,
  Timer,
  X,
} from 'lucide-react';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { TeamLogo } from '@/components/shared/TeamLogo';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { formatPrice } from '@/lib/utils/price-formatter';
import teamsData from '@/data/teams.json';

/* ── Demo Data ──────────────────────────────────────────────── */

const DEMO_PLAYER = {
  name: 'Virat Kohli',
  role: 'BAT' as const,
  country: 'India',
  countryCode: 'IND',
  countryFlag: '\u{1F1EE}\u{1F1F3}',
  isOverseas: false,
  basePrice: 200,
  stats: {
    matches: 237,
    runs: 7579,
    average: 37.25,
    sr: 130.02,
    wickets: 4,
    economy: 8.83,
  },
};

const DEMO_CURRENT_BID = {
  amount: 1400,
  bidderTeamId: 'rcb',
};

const DEMO_BID_HISTORY = [
  { teamId: 'csk', teamShort: 'CSK', amount: 1000, time: '2:34' },
  { teamId: 'mi', teamShort: 'MI', amount: 1100, time: '2:28' },
  { teamId: 'kkr', teamShort: 'KKR', amount: 1200, time: '2:15' },
  { teamId: 'rcb', teamShort: 'RCB', amount: 1400, time: '2:02' },
];

const DEMO_MY_TEAM = {
  id: 'csk',
  shortName: 'CSK',
  purse: 8540,
  totalPlayers: 14,
  maxPlayers: 25,
  overseas: 5,
  maxOverseas: 8,
  recentBuys: [
    { name: 'Ravindra Jadeja', price: 1600 },
    { name: 'Devon Conway', price: 240 },
    { name: 'Deepak Chahar', price: 1400 },
  ],
};

const DEMO_ALL_TEAMS_PURSE = teamsData.map((t, i) => ({
  ...t,
  purse: [8540, 7200, 6100, 8900, 7800, 9200, 6800, 7500, 8100, 5600][i],
  totalPurse: 12000,
})).sort((a, b) => b.purse - a.purse);

const DEMO_SET = {
  name: 'Set 1: Marquee Players',
  current: 3,
  total: 8,
};

const DEMO_ACTIVITY = [
  { id: 1, text: 'Auction started - Set 1: Marquee Players', type: 'system' as const, time: '2:45' },
  { id: 2, text: 'Ravindra Jadeja SOLD to CSK for 16 Cr', type: 'sold' as const, time: '2:42' },
  { id: 3, text: 'Devon Conway SOLD to CSK for 2.40 Cr', type: 'sold' as const, time: '2:38' },
  { id: 4, text: 'Virat Kohli up for auction - Base: 2 Cr', type: 'system' as const, time: '2:35' },
  { id: 5, text: 'CSK bid 10 Cr for Virat Kohli', type: 'bid' as const, time: '2:34' },
  { id: 6, text: 'MI bid 11 Cr for Virat Kohli', type: 'bid' as const, time: '2:28' },
  { id: 7, text: 'KKR bid 12 Cr for Virat Kohli', type: 'bid' as const, time: '2:15' },
  { id: 8, text: 'RCB bid 14 Cr for Virat Kohli', type: 'bid' as const, time: '2:02' },
];

const DEMO_CHAT = [
  { id: 1, user: 'Rahul', team: 'MI', msg: 'RCB going all in for Kohli lol', time: '2:30' },
  { id: 2, user: 'Priya', team: 'KKR', msg: 'We need to save purse for bowlers', time: '2:20' },
  { id: 3, user: 'Arjun', team: 'RCB', msg: 'Kohli is ours!', time: '2:05' },
  { id: 4, user: 'System', team: '', msg: 'Bidding is live...', time: '2:00' },
];

const NEXT_BID_AMOUNT = 1600;

/* ── Component ──────────────────────────────────────────────── */

export default function AuctionPage() {
  const [timer, setTimer] = useState(7);
  const [showSoldOverlay, setShowSoldOverlay] = useState(false);
  const [showUnsoldOverlay, setShowUnsoldOverlay] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'activity' | 'chat'>('activity');
  const [chatInput, setChatInput] = useState('');

  // Countdown timer (demo)
  useEffect(() => {
    if (timer <= 0 || showSoldOverlay || showUnsoldOverlay) return;
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timer, showSoldOverlay, showUnsoldOverlay]);

  const resetTimer = useCallback(() => setTimer(7), []);

  // Auto-dismiss overlays after 3s
  useEffect(() => {
    if (!showSoldOverlay && !showUnsoldOverlay) return;
    const id = setTimeout(() => {
      setShowSoldOverlay(false);
      setShowUnsoldOverlay(false);
      resetTimer();
    }, 3000);
    return () => clearTimeout(id);
  }, [showSoldOverlay, showUnsoldOverlay, resetTimer]);

  const TIMER_DURATION = 15;
  const timerPercent = (timer / TIMER_DURATION) * 100;
  const timerStrokeColor =
    timer > 5 ? '#10b981' : timer > 3 ? '#eab308' : '#ef4444';
  const timerTextColor =
    timer > 5 ? 'text-green-400' : timer > 3 ? 'text-yellow-400' : 'text-red-400';
  const timerPulse = timer <= 3 && timer > 0;

  const circumference = 2 * Math.PI * 52;

  const bidderTeam = teamsData.find((t) => t.id === DEMO_CURRENT_BID.bidderTeamId);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* ═══════ SOLD OVERLAY ═══════ */}
      {showSoldOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/95 via-emerald-900/95 to-green-950/95 backdrop-blur-xl" />
          {/* Confetti dots */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#ff6b00', '#00d4ff', '#10b981', '#eab308', '#ec4899'][i % 5],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                  opacity: 0.7 + Math.random() * 0.3,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 text-center space-y-6">
            <p className="text-8xl font-black tracking-wider text-green-300 drop-shadow-[0_0_40px_rgba(16,185,129,0.6)]
              animate-pulse">
              SOLD!
            </p>
            {bidderTeam && (
              <div className="flex items-center justify-center gap-4">
                <TeamLogo shortName={bidderTeam.shortName} primaryColor={bidderTeam.primaryColor} size="lg" />
                <span className="text-3xl font-bold text-white">{bidderTeam.name}</span>
              </div>
            )}
            <p className="text-4xl font-bold text-white">{DEMO_PLAYER.name}</p>
            <p className="text-5xl font-black text-orange-400 drop-shadow-[0_0_20px_rgba(255,107,0,0.5)]">
              {formatPrice(DEMO_CURRENT_BID.amount)}
            </p>
            <button
              onClick={() => {
                setShowSoldOverlay(false);
                resetTimer();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20
                px-8 py-3 text-lg font-semibold text-white backdrop-blur-sm
                hover:bg-white/20 transition-all"
            >
              Next Player <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ UNSOLD OVERLAY ═══════ */}
      {showUnsoldOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-red-950/90 to-gray-900/95 backdrop-blur-xl" />
          <div className="relative z-10 text-center space-y-6">
            <p className="text-8xl font-black tracking-wider text-red-400 drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]
              animate-pulse">
              UNSOLD
            </p>
            <p className="text-4xl font-bold text-gray-300">{DEMO_PLAYER.name}</p>
            <p className="text-xl text-gray-500">No team placed a winning bid</p>
            <button
              onClick={() => {
                setShowUnsoldOverlay(false);
                resetTimer();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20
                px-8 py-3 text-lg font-semibold text-white backdrop-blur-sm
                hover:bg-white/20 transition-all"
            >
              Next Player <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ TOP BAR (sticky) ═══════ */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0e1a]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: room + online */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
              <span className="text-xs text-gray-400">Room</span>
              <span className="font-mono font-bold text-[#00d4ff] text-sm tracking-widest">ABCD12</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Wifi size={14} className="text-green-400" />
              <span className="text-green-400 font-medium">8</span> online
            </div>
          </div>

          {/* Center: set progress */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300 font-medium">
              {DEMO_SET.name} &mdash; {DEMO_SET.current}/{DEMO_SET.total}
            </span>
            <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ff6b00] to-orange-400 transition-all duration-500"
                style={{ width: `${(DEMO_SET.current / DEMO_SET.total) * 100}%` }}
              />
            </div>
          </div>

          {/* Right: host controls + purse */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30
              px-3 py-1.5 text-sm font-medium text-yellow-400 hover:bg-yellow-500/20 transition-colors">
              <Pause size={14} /> Pause
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/30
              px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors">
              <Square size={14} /> End
            </button>
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-[#ff6b00]/10 border border-[#ff6b00]/30 px-3 py-1.5">
              <Wallet size={14} className="text-[#ff6b00]" />
              <span className="text-sm font-bold text-[#ff6b00]">
                Your Purse: {formatPrice(DEMO_MY_TEAM.purse)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── LEFT COLUMN (2/3) ─── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Player Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl p-6">
              {/* Decorative gradient glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#ff6b00]/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#00d4ff]/10 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Name + Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    {DEMO_PLAYER.name}
                  </h1>
                  <RoleBadge role={DEMO_PLAYER.role} className="text-sm px-3 py-1" />
                  {DEMO_PLAYER.isOverseas && (
                    <span className="rounded-full bg-[#00d4ff]/20 border border-[#00d4ff]/40
                      px-3 py-0.5 text-xs font-bold text-[#00d4ff] tracking-wide">
                      OS
                    </span>
                  )}
                </div>

                {/* Country + Base Price */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-xl">{DEMO_PLAYER.countryFlag}</span>
                    <span className="font-medium">{DEMO_PLAYER.countryCode}</span>
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Base Price:</span>
                    <span className="text-sm font-bold text-[#ff6b00]">{formatPrice(DEMO_PLAYER.basePrice)}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { label: 'Matches', value: DEMO_PLAYER.stats.matches },
                    { label: 'Runs', value: DEMO_PLAYER.stats.runs.toLocaleString() },
                    { label: 'Average', value: DEMO_PLAYER.stats.average.toFixed(2) },
                    { label: 'Strike Rate', value: DEMO_PLAYER.stats.sr.toFixed(1) },
                    { label: 'Wickets', value: DEMO_PLAYER.stats.wickets },
                    { label: 'Economy', value: DEMO_PLAYER.stats.economy.toFixed(2) },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-white/5 border border-white/10 p-3 text-center
                        hover:bg-white/10 transition-colors"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bid Section */}
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl p-6">
              {/* Current Bid Display */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Current Bid</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl md:text-5xl font-black text-white">
                      {formatPrice(DEMO_CURRENT_BID.amount)}
                    </span>
                    {bidderTeam && (
                      <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                        <TeamLogo shortName={bidderTeam.shortName} primaryColor={bidderTeam.primaryColor} size="sm" />
                        <span className="text-sm font-bold text-gray-300">{bidderTeam.shortName}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Gavel size={36} className="text-[#ff6b00]/40" />
              </div>

              {/* Bid History */}
              <div className="mb-5 space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
                {DEMO_BID_HISTORY.slice().reverse().map((bid, i) => {
                  const team = teamsData.find((t) => t.id === bid.teamId);
                  return (
                    <div
                      key={`${bid.teamId}-${bid.amount}`}
                      className={clsx(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                        i === 0
                          ? 'bg-[#ff6b00]/10 border border-[#ff6b00]/20'
                          : 'bg-white/5 border border-transparent',
                      )}
                    >
                      {team && (
                        <TeamLogo shortName={team.shortName} primaryColor={team.primaryColor} size="sm" />
                      )}
                      <span className="font-medium text-gray-300">{bid.teamShort}</span>
                      <span className="text-gray-500">bid</span>
                      <span className="font-bold text-white">{formatPrice(bid.amount)}</span>
                      <span className="ml-auto text-xs text-gray-600">{bid.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  className="w-full rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669]
                    py-4 text-xl font-black text-white tracking-wide
                    shadow-lg shadow-green-500/20
                    hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02]
                    active:scale-[0.98]
                    transition-all duration-200"
                >
                  BID {formatPrice(NEXT_BID_AMOUNT)}
                </button>

                {showSkipConfirm ? (
                  <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                    <span className="text-sm text-gray-300 flex-1">
                      Skip this player? You won&apos;t be able to bid.
                    </span>
                    <button
                      onClick={() => setShowSkipConfirm(false)}
                      className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300
                        hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white
                        hover:bg-red-500 transition-colors"
                    >
                      Confirm Skip
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSkipConfirm(true)}
                    className="w-full rounded-xl bg-white/5 border border-white/10
                      py-3 text-sm font-semibold text-gray-400
                      hover:bg-white/10 hover:text-gray-300 transition-all"
                  >
                    SKIP
                  </button>
                )}
              </div>
            </div>

            {/* Demo Overlay Triggers (for testing) */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSoldOverlay(true)}
                className="flex-1 rounded-xl bg-green-500/10 border border-green-500/20 py-2 text-sm
                  font-medium text-green-400 hover:bg-green-500/20 transition-colors"
              >
                Demo: Show SOLD
              </button>
              <button
                onClick={() => setShowUnsoldOverlay(true)}
                className="flex-1 rounded-xl bg-red-500/10 border border-red-500/20 py-2 text-sm
                  font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Demo: Show UNSOLD
              </button>
            </div>

            {/* Activity / Chat Tabs (Bottom Section) */}
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab('activity')}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors',
                    activeTab === 'activity'
                      ? 'text-[#ff6b00] border-b-2 border-[#ff6b00] bg-[#ff6b00]/5'
                      : 'text-gray-500 hover:text-gray-300',
                  )}
                >
                  <Activity size={16} /> Activity
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors',
                    activeTab === 'chat'
                      ? 'text-[#00d4ff] border-b-2 border-[#00d4ff] bg-[#00d4ff]/5'
                      : 'text-gray-500 hover:text-gray-300',
                  )}
                >
                  <MessageSquare size={16} /> Chat
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 max-h-64 overflow-y-auto">
                {activeTab === 'activity' ? (
                  <div className="space-y-2">
                    {DEMO_ACTIVITY.map((item) => (
                      <div
                        key={item.id}
                        className={clsx(
                          'flex items-start gap-3 rounded-lg px-3 py-2 text-sm',
                          item.type === 'sold' && 'bg-green-500/5 border border-green-500/10',
                          item.type === 'bid' && 'bg-white/5',
                          item.type === 'system' && 'bg-[#00d4ff]/5 border border-[#00d4ff]/10',
                        )}
                      >
                        <span className="text-xs text-gray-600 mt-0.5 shrink-0">{item.time}</span>
                        <span className={clsx(
                          'flex-1',
                          item.type === 'sold' && 'text-green-400 font-medium',
                          item.type === 'bid' && 'text-gray-300',
                          item.type === 'system' && 'text-[#00d4ff]',
                        )}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="space-y-3 flex-1 mb-3">
                      {DEMO_CHAT.map((msg) => (
                        <div key={msg.id} className="flex items-start gap-2 text-sm">
                          <span className="font-bold text-[#ff6b00] shrink-0">{msg.user}</span>
                          {msg.team && (
                            <span className="text-[10px] text-gray-600 bg-white/5 rounded px-1 mt-0.5">
                              {msg.team}
                            </span>
                          )}
                          <span className="text-gray-300 flex-1">{msg.msg}</span>
                          <span className="text-xs text-gray-600 shrink-0">{msg.time}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm
                          text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4ff]/50
                          transition-colors"
                      />
                      <button className="rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 px-3 py-2
                        text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-colors">
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN (1/3) ─── */}
          <div className="flex flex-col gap-6">

            {/* Timer */}
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl p-6
              flex flex-col items-center">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-1.5">
                <Timer size={12} /> Time Remaining
              </p>
              <div className={clsx('relative w-36 h-36', timerPulse && 'animate-pulse')}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Background track */}
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-white/5"
                  />
                  {/* Animated arc */}
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke={timerStrokeColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - timerPercent / 100)}
                    className="transition-all duration-1000 ease-linear"
                    style={{
                      filter: `drop-shadow(0 0 8px ${timerStrokeColor}80)`,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={clsx('text-5xl font-black tabular-nums', timerTextColor)}>
                    {timer}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">seconds</p>
            </div>

            {/* Your Squad Summary */}
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl p-5">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-1.5">
                <Trophy size={12} className="text-[#ff6b00]" /> Your Squad
              </h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Users size={14} /> Players
                  </span>
                  <span className="text-sm font-bold text-white">
                    {DEMO_MY_TEAM.totalPlayers}
                    <span className="text-gray-600">/{DEMO_MY_TEAM.maxPlayers}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Globe size={14} /> Overseas
                  </span>
                  <span className="text-sm font-bold text-white">
                    {DEMO_MY_TEAM.overseas}
                    <span className="text-gray-600">/{DEMO_MY_TEAM.maxOverseas}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-1.5">
                    <Wallet size={14} /> Purse
                  </span>
                  <PriceDisplay lakhs={DEMO_MY_TEAM.purse} className="text-sm" />
                </div>
              </div>

              {/* Recent Buys */}
              <div className="border-t border-white/10 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">Recent Buys</p>
                <div className="space-y-2">
                  {DEMO_MY_TEAM.recentBuys.map((buy) => (
                    <div key={buy.name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 truncate mr-2">{buy.name}</span>
                      <PriceDisplay lakhs={buy.price} className="text-xs shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* All Teams Purse */}
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl p-5">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                All Teams Purse
              </h3>
              <div className="space-y-2.5">
                {DEMO_ALL_TEAMS_PURSE.map((team) => {
                  const percent = (team.purse / team.totalPurse) * 100;
                  return (
                    <div key={team.id} className="group">
                      <div className="flex items-center gap-2 mb-1">
                        <TeamLogo
                          shortName={team.shortName}
                          primaryColor={team.primaryColor}
                          size="sm"
                          className="w-6 h-6 text-[8px]"
                        />
                        <span className="text-xs font-medium text-gray-400 w-10">{team.shortName}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percent}%`,
                              background: `linear-gradient(to right, ${team.primaryColor}cc, ${team.primaryColor}88)`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-gray-500 w-16 text-right">
                          {formatPrice(team.purse)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* confetti-fall keyframes defined in globals.css */}
    </div>
  );
}
