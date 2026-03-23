'use client';

import Link from 'next/link';
import { use } from 'react';
import { TeamLogo } from '@/components/shared/TeamLogo';
import teamsData from '@/data/teams.json';
import { ArrowLeft } from 'lucide-react';

/* ── Sample data per team ─────────────────────────────────── */

const TEAM_POINTS: Record<string, number> = {
  rcb: 10535, csk: 9750, kkr: 9023, rr: 8999, mi: 8750,
  dc: 8500, pbks: 8200, srh: 7900, gt: 7600, lsg: 7300,
};

const TEAM_RANK_ORDER = ['rcb', 'csk', 'kkr', 'rr', 'mi', 'dc', 'pbks', 'srh', 'gt', 'lsg'];

const DEMO_PLAYERS: Record<string, { name: string; points: number }[]> = {
  rcb: [
    { name: 'Virat Kohli', points: 1250 },
    { name: 'Faf du Plessis', points: 1050 },
    { name: 'Glenn Maxwell', points: 980 },
    { name: 'Mohammed Siraj', points: 920 },
    { name: 'Rajat Patidar', points: 870 },
    { name: 'Wanindu Hasaranga', points: 850 },
    { name: 'Dinesh Karthik', points: 810 },
    { name: 'Harshal Patel', points: 790 },
    { name: 'Josh Hazlewood', points: 720 },
    { name: 'Anuj Rawat', points: 680 },
    { name: 'Shahbaz Ahmed', points: 650 },
    { name: 'Karn Sharma', points: 465 },
  ],
  csk: [
    { name: 'Ruturaj Gaikwad', points: 1100 },
    { name: 'Ravindra Jadeja', points: 1020 },
    { name: 'Devon Conway', points: 950 },
    { name: 'Matheesha Pathirana', points: 890 },
    { name: 'Shivam Dube', points: 830 },
    { name: 'Moeen Ali', points: 800 },
    { name: 'Deepak Chahar', points: 780 },
    { name: 'Tushar Deshpande', points: 750 },
    { name: 'Ajinkya Rahane', points: 720 },
    { name: 'Rachin Ravindra', points: 680 },
    { name: 'Shardul Thakur', points: 630 },
    { name: 'Maheesh Theekshana', points: 600 },
  ],
};

// Generate generic demo players for teams without specific data
function getPlayersForTeam(teamId: string): { name: string; points: number }[] {
  if (DEMO_PLAYERS[teamId]) return DEMO_PLAYERS[teamId];
  const total = TEAM_POINTS[teamId] || 7500;
  const names = [
    'Player A', 'Player B', 'Player C', 'Player D', 'Player E', 'Player F',
    'Player G', 'Player H', 'Player I', 'Player J', 'Player K', 'Player L',
  ];
  const weights = [14, 12, 11, 10, 9, 9, 8, 7, 7, 6, 4, 3];
  const sumW = weights.reduce((a, b) => a + b, 0);
  return names.map((n, i) => ({
    name: n,
    points: Math.round((weights[i] / sumW) * total),
  }));
}

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);

  const team = teamsData.find((t) => t.id === teamId);
  const rank = TEAM_RANK_ORDER.indexOf(teamId) + 1 || '?';
  const totalPoints = TEAM_POINTS[teamId] || 0;
  const players = getPlayersForTeam(teamId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Back button */}
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Leaderboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {team && (
          <TeamLogo
            shortName={team.shortName}
            primaryColor={team.primaryColor}
            size="lg"
          />
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            <span className="text-gray-500 mr-2">#{rank}</span>
            {team?.name || teamId.toUpperCase()}
          </h1>
          <p className="text-orange-500 text-xl font-semibold">
            {totalPoints.toLocaleString()} Points
          </p>
        </div>
      </div>

      {/* Players table */}
      <div className="rounded-2xl border border-gray-800 bg-[#111827] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[3rem_1fr_6rem] px-4 py-3 border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
          <span>#</span>
          <span>Player Name</span>
          <span className="text-right">Points</span>
        </div>

        {/* Rows */}
        {players.map((player, idx) => {
          const isTop3 = idx < 3;
          return (
            <div
              key={idx}
              className={`grid grid-cols-[3rem_1fr_6rem] px-4 py-3 items-center transition-colors ${
                idx % 2 === 0 ? 'bg-white/[0.02]' : ''
              } ${isTop3 ? 'bg-orange-500/5' : ''}`}
            >
              <span
                className={`text-sm font-medium ${
                  isTop3 ? 'text-orange-400' : 'text-gray-500'
                }`}
              >
                {idx + 1}
              </span>
              <span
                className={`text-sm ${
                  isTop3 ? 'text-white font-semibold' : 'text-gray-300'
                }`}
              >
                {player.name}
              </span>
              <span
                className={`text-sm text-right tabular-nums ${
                  isTop3 ? 'text-orange-400 font-semibold' : 'text-gray-400'
                }`}
              >
                {player.points.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
