'use client';

import Link from 'next/link';
import { TeamLogo } from '@/components/shared/TeamLogo';
import teamsData from '@/data/teams.json';
import { Trophy } from 'lucide-react';

/* ── Sample leaderboard data ──────────────────────────────── */

const LEADERBOARD = [
  { teamId: 'rcb', points: 10535 },
  { teamId: 'csk', points: 9750 },
  { teamId: 'kkr', points: 9023 },
  { teamId: 'rr', points: 8999 },
  { teamId: 'mi', points: 8750 },
  { teamId: 'dc', points: 8500 },
  { teamId: 'pbks', points: 8200 },
  { teamId: 'srh', points: 7900 },
  { teamId: 'gt', points: 7600 },
  { teamId: 'lsg', points: 7300 },
];

const RANK_STYLES: Record<number, string> = {
  1: 'border-yellow-500/50 bg-yellow-500/10',
  2: 'border-gray-400/50 bg-gray-400/10',
  3: 'border-amber-700/50 bg-amber-700/10',
};

const RANK_BADGE: Record<number, string> = {
  1: 'bg-yellow-500 text-black',
  2: 'bg-gray-400 text-black',
  3: 'bg-amber-700 text-white',
};

export default function LeaderboardPage() {
  const teamsMap = Object.fromEntries(teamsData.map((t) => [t.id, t]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Trophy className="text-yellow-500" size={32} />
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Fantasy Leaderboard
          </h1>
        </div>
        <p className="text-gray-400">Top performing franchise squads</p>
      </div>

      {/* Ranked list */}
      <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
        {LEADERBOARD.map((entry, idx) => {
          const rank = idx + 1;
          const team = teamsMap[entry.teamId];
          if (!team) return null;

          const isTop3 = rank <= 3;

          return (
            <Link key={entry.teamId} href={`/leaderboard/${entry.teamId}`}>
              <div
                className={`flex items-center gap-4 rounded-2xl border p-4 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                  isTop3
                    ? RANK_STYLES[rank]
                    : 'border-gray-800 bg-[#111827] hover:bg-white/5'
                }`}
              >
                {/* Rank */}
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold shrink-0 ${
                    isTop3
                      ? RANK_BADGE[rank]
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {rank}
                </div>

                {/* Team logo */}
                <TeamLogo
                  shortName={team.shortName}
                  primaryColor={team.primaryColor}
                  size="md"
                />

                {/* Team name */}
                <span className="flex-1 text-white font-medium text-lg">
                  {team.name}
                </span>

                {/* Points */}
                <span className="text-2xl font-bold text-orange-500 tabular-nums">
                  {entry.points.toLocaleString()}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
