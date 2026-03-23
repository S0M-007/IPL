'use client';

import { useState, useEffect } from 'react';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { AlertTriangle, Users, ChevronRight, Info } from 'lucide-react';

/* ── Sample demo data ─────────────────────────────────────── */

const DEMO_PLAYER = {
  name: 'Virat Kohli',
  role: 'BAT' as const,
  country: 'India',
  countryFlag: '\uD83C\uDDEE\uD83C\uDDF3',
  isOverseas: false,
  stats: {
    matches: 237,
    innings: 226,
    runs: 7579,
    average: 37.25,
    sr: 130.02,
    wickets: 4,
  },
};

const DEMO_BID = {
  currentBid: 1200, // 12 Cr in lakhs
  myPurse: 8500,    // 85 Cr remaining
};

const DEMO_SET = {
  name: 'Set 1: Marquee',
  current: 3,
  total: 10,
};

const DEMO_OTHER_TEAMS = [
  { name: 'CSK', players: 4, spent: 3400 },
  { name: 'MI', players: 3, spent: 2800 },
  { name: 'KKR', players: 5, spent: 4100 },
  { name: 'DC', players: 2, spent: 1900 },
];

/* ── Component ────────────────────────────────────────────── */

export default function AuctionPage() {
  const [timer, setTimer] = useState(15);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Countdown timer (demo)
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const timerPercent = (timer / 15) * 100;
  const timerColor =
    timer > 10 ? 'text-green-400' : timer > 5 ? 'text-yellow-400' : 'text-red-400';
  const timerBorderColor =
    timer > 10
      ? 'border-green-500'
      : timer > 5
        ? 'border-yellow-500'
        : 'border-red-500';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── LEFT SIDE (70%) ─────────────────────────────── */}
        <div className="lg:w-[70%] flex flex-col gap-6">
          {/* Player Details Card */}
          <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
            {/* Top row: name + badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {DEMO_PLAYER.name}
              </h1>
              <RoleBadge role={DEMO_PLAYER.role} className="text-sm px-3 py-1" />
              {DEMO_PLAYER.isOverseas && (
                <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-3 py-0.5 text-xs font-medium text-cyan-400">
                  OS
                </span>
              )}
            </div>

            {/* Country */}
            <p className="text-gray-400 mb-6 text-lg">
              <span className="mr-2 text-xl">{DEMO_PLAYER.countryFlag}</span>
              {DEMO_PLAYER.country}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Matches', value: DEMO_PLAYER.stats.matches },
                { label: 'Innings', value: DEMO_PLAYER.stats.innings },
                { label: 'Runs', value: DEMO_PLAYER.stats.runs.toLocaleString() },
                { label: 'Average', value: DEMO_PLAYER.stats.average.toFixed(2) },
                { label: 'SR', value: DEMO_PLAYER.stats.sr.toFixed(2) },
                { label: 'Wickets', value: DEMO_PLAYER.stats.wickets },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white/5 border border-white/10 p-3 text-center"
                >
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="rounded-2xl border border-gray-800 bg-[#111827] p-4">
            {/* Bid info row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Current Bid:</span>
                <PriceDisplay lakhs={DEMO_BID.currentBid} className="text-xl" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Your Purse:</span>
                <PriceDisplay lakhs={DEMO_BID.myPurse} className="text-xl" />
              </div>
            </div>

            {/* Buttons row */}
            <div className="flex gap-3">
              {/* BID */}
              <button className="flex-[7] rounded-xl bg-gradient-to-r from-green-600 to-green-500 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/30">
                BID
              </button>

              {/* SKIP */}
              {showSkipConfirm ? (
                <div className="flex-[3] flex gap-2">
                  <button
                    onClick={() => setShowSkipConfirm(false)}
                    className="flex-1 rounded-xl bg-gray-700 py-4 text-sm font-medium text-gray-300 hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 rounded-xl bg-red-600 py-4 text-sm font-bold text-white hover:bg-red-500 transition-colors">
                    Confirm
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSkipConfirm(true)}
                  className="flex-[3] rounded-xl bg-gray-700 py-4 text-lg font-bold text-gray-300 transition-all hover:bg-gray-600 hover:scale-105"
                >
                  SKIP
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDE (30%) ────────────────────────────── */}
        <div className="lg:w-[30%] flex flex-col gap-6">
          {/* Timer */}
          <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 flex flex-col items-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Time Remaining
            </p>
            <div className="relative w-28 h-28 mb-2">
              {/* Background circle */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-800"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - timerPercent / 100)}`}
                  strokeLinecap="round"
                  className={`${timerBorderColor.replace('border-', 'text-')} transition-all duration-1000`}
                />
              </svg>
              {/* Number */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-4xl font-bold ${timerColor}`}>{timer}</span>
              </div>
            </div>
          </div>

          {/* Player Set */}
          <div className="rounded-2xl border border-gray-800 bg-[#111827] p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Player Set
            </p>
            <p className="text-white font-semibold mb-2">{DEMO_SET.name}</p>
            {/* Progress */}
            <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden mb-1">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-500 transition-all"
                style={{ width: `${(DEMO_SET.current / DEMO_SET.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {DEMO_SET.current} of {DEMO_SET.total} players
            </p>
          </div>

          {/* All Players button */}
          <button className="w-full flex items-center justify-between rounded-2xl border border-gray-800 bg-[#111827] p-4 text-gray-300 hover:bg-white/5 transition-colors">
            <span className="flex items-center gap-2">
              <Users size={18} className="text-orange-500" />
              <span className="font-medium">All Players</span>
            </span>
            <ChevronRight size={18} />
          </button>

          {/* Info Panel */}
          <div className="rounded-2xl border border-gray-800 bg-[#111827] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-cyan-400" />
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Other Teams
              </p>
            </div>
            <div className="space-y-2">
              {DEMO_OTHER_TEAMS.map((team) => (
                <div
                  key={team.name}
                  className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                >
                  <div>
                    <span className="text-sm font-medium text-white">
                      {team.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {team.players} players
                    </span>
                  </div>
                  <PriceDisplay lakhs={team.spent} className="text-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
