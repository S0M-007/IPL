import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wallet, Users } from 'lucide-react';
import teamsData from '@/data/teams.json';
import retentionsData from '@/data/retentions.json';
import playersData from '@/data/players.json';

type RetentionsMap = Record<
  string,
  { purseUsed: number; purseRemaining: number; retained: { playerId: string; price: number; slot: number }[] }
>;
const retentions = retentionsData as RetentionsMap;

export function generateStaticParams() {
  return teamsData.map((team) => ({ teamId: team.id }));
}

const ROLE_LABELS: Record<string, string> = {
  BAT: 'Batsman',
  BOWL: 'Bowler',
  AR: 'All-Rounder',
  WK: 'Wicket-Keeper',
};

const ROLE_COLORS: Record<string, string> = {
  BAT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  BOWL: 'bg-red-500/20 text-red-400 border-red-500/30',
  AR: 'bg-green-500/20 text-green-400 border-green-500/30',
  WK: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

function formatPrice(lakhs: number): string {
  if (lakhs >= 100) {
    const cr = lakhs / 100;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  return `₹${lakhs} L`;
}

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = teamsData.find((t) => t.id === teamId);
  if (!team) notFound();

  const teamRetentions = retentions[teamId];

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Back link */}
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Teams
        </Link>
      </div>

      {/* Team header */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(ellipse at center top, ${team.primaryColor}, transparent 70%)`,
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-12 flex flex-col sm:flex-row items-center gap-6">
          {/* Large team logo circle */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-extrabold shrink-0"
            style={{
              backgroundColor: `${team.primaryColor}20`,
              color: team.primaryColor,
              border: `3px solid ${team.primaryColor}50`,
              boxShadow: `0 0 40px ${team.primaryColor}25`,
            }}
          >
            {team.shortName}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">{team.name}</h1>
            <p className="text-gray-400 text-lg">{team.homeGround}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 pb-16">
        {teamRetentions && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-center">
                <div className="flex justify-center mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${team.primaryColor}20` }}
                  >
                    <Wallet size={20} style={{ color: team.primaryColor }} />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-1">Purse Remaining</p>
                <p className="text-2xl font-bold text-orange-500">{formatPrice(teamRetentions.purseRemaining)}</p>
              </div>
              <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-center">
                <div className="flex justify-center mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${team.primaryColor}20` }}
                  >
                    <Users size={20} style={{ color: team.primaryColor }} />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-1">Retained Players</p>
                <p className="text-2xl font-bold text-white">{teamRetentions.retained.length}</p>
              </div>
            </div>

            {/* Retained players list */}
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span
                className="w-1 h-6 rounded-full"
                style={{ backgroundColor: team.primaryColor }}
              />
              Retained Players
            </h2>
            <div className="space-y-3">
              {teamRetentions.retained.map((r, idx) => {
                const player = playersData.find((p) => p.id === r.playerId);
                return (
                  <div
                    key={r.playerId}
                    className="bg-gray-900/50 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-xl flex items-center justify-between transition-all duration-300 hover:border-white/20 hover:bg-white/5 group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Slot number */}
                      <span className="text-xs text-gray-600 font-mono w-5">#{idx + 1}</span>

                      {/* Role badge */}
                      {player && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_COLORS[player.role] || ''}`}
                        >
                          {ROLE_LABELS[player.role] || player.role}
                        </span>
                      )}

                      {/* Player name */}
                      <span className="font-semibold text-white">{player?.name || r.playerId}</span>

                      {/* Overseas badge */}
                      {player?.isOverseas && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold">
                          OS
                        </span>
                      )}
                    </div>

                    {/* Retention price */}
                    <span className="text-orange-500 font-bold whitespace-nowrap">
                      {formatPrice(r.price)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
