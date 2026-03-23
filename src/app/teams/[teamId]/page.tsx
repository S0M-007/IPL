import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { TeamLogo } from '@/components/shared/TeamLogo';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import teamsData from '@/data/teams.json';
import retentionsData from '@/data/retentions.json';
import playersData from '@/data/players.json';

type RetentionsMap = Record<string, { purseUsed: number; purseRemaining: number; retained: { playerId: string; price: number; slot: number }[] }>;
const retentions = retentionsData as RetentionsMap;

export function generateStaticParams() {
  return teamsData.map((team) => ({ teamId: team.id }));
}

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = teamsData.find((t) => t.id === teamId);
  if (!team) notFound();

  const teamRetentions = retentions[teamId];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <TeamLogo shortName={team.shortName} primaryColor={team.primaryColor} size="lg" />
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-gray-400">{team.homeGround}</p>
        </div>
      </div>

      {teamRetentions && (
        <>
          <div className="flex gap-4 mb-6">
            <Card className="flex-1 text-center">
              <p className="text-sm text-gray-400">Purse Remaining</p>
              <PriceDisplay lakhs={teamRetentions.purseRemaining} className="text-xl" />
            </Card>
            <Card className="flex-1 text-center">
              <p className="text-sm text-gray-400">Retained</p>
              <p className="text-xl font-bold text-white">{teamRetentions.retained.length}</p>
            </Card>
          </div>

          <h2 className="text-lg font-semibold mb-3">Retained Players</h2>
          <div className="space-y-2">
            {teamRetentions.retained.map((r) => {
              const player = playersData.find((p) => p.id === r.playerId);
              return (
                <Card key={r.playerId} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {player && <RoleBadge role={player.role} />}
                    <span className="font-medium">{player?.name || r.playerId}</span>
                    {player?.isOverseas && <span className="text-xs text-green-400">OS</span>}
                  </div>
                  <PriceDisplay lakhs={r.price} />
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
