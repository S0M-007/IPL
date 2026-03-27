import { notFound } from 'next/navigation';
import { getTeams, getTeamById, getTeamRetention, getPlayerById } from '@/lib/data';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card } from '@/components/ui';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { CountryFlag } from '@/components/shared/CountryFlag';
import { formatPrice } from '@/lib/utils';
import type { PlayerRole } from '@/lib/types';

export function generateStaticParams() {
  return getTeams().map((team) => ({ teamId: team.id }));
}

export default async function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = getTeamById(teamId);
  if (!team) notFound();

  const retention = getTeamRetention(teamId);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg"
            style={{
              backgroundColor: team.primaryColor,
              color: teamId === 'csk' ? '#1a1a1a' : '#fff',
            }}
          >
            {team.shortName}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{team.name}</h1>
            <p className="text-gray-400">{team.homeGround}</p>
          </div>
        </div>

        {retention && (
          <>
            <Card variant="elevated" className="p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Purse Overview</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Total Purse</p>
                  <p className="text-xl font-bold text-white">₹{formatPrice(12000)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Spent</p>
                  <p className="text-xl font-bold text-red-400">₹{formatPrice(retention.purseUsed)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Remaining</p>
                  <p className="text-xl font-bold text-emerald-400">₹{formatPrice(retention.purseRemaining)}</p>
                </div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${(retention.purseRemaining / 12000) * 100}%`,
                    backgroundColor: team.primaryColor,
                  }}
                />
              </div>
            </Card>

            <Card variant="elevated" className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Retained Players ({retention.retained.length})
              </h2>
              <div className="space-y-3">
                {retention.retained
                  .sort((a, b) => a.slot - b.slot)
                  .map((r) => {
                    const player = getPlayerById(r.playerId);
                    return (
                      <div
                        key={r.playerId}
                        className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500 w-6">#{r.slot}</span>
                          <div>
                            <p className="font-medium text-white">
                              {player?.name ?? r.playerId}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {player && <RoleBadge role={player.role as PlayerRole} size="sm" />}
                              {player && (
                                <CountryFlag
                                  country={player.country}
                                  isOverseas={player.isOverseas}
                                  size="sm"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <PriceDisplay amount={r.price} size="md" />
                      </div>
                    );
                  })}
              </div>
            </Card>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
