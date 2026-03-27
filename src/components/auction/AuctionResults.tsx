import { getPlayerById } from '@/lib/data';
import { Card } from '@/components/ui/Card';
import { TeamLogo } from '@/components/shared/TeamLogo';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { getTeamById } from '@/lib/utils';
import type { AuctionState, PlayerRole } from '@/lib/types';

interface AuctionResultsProps {
  auction: AuctionState;
}

export function AuctionResults({ auction }: AuctionResultsProps) {
  const teamResults = Object.entries(auction.purses)
    .map(([teamId, purse]) => {
      const team = getTeamById(teamId);
      const players = (auction.soldPlayers || [])
        .filter((sp) => sp.teamId === teamId)
        .map((sp) => ({ ...sp, player: getPlayerById(sp.playerId) }));
      return { teamId, team, purse, players };
    })
    .sort((a, b) => b.players.length - a.players.length);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white text-center mb-2">Auction Complete!</h1>
      <p className="text-gray-400 text-center mb-8">Final squad compositions</p>

      <div className="space-y-6">
        {teamResults.map(({ teamId, team, purse, players }) => (
          <Card key={teamId} teamColor={team?.primaryColor} variant="elevated" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TeamLogo teamId={teamId} size="lg" />
              <div>
                <h2 className="text-lg font-bold text-white">{team?.name || teamId}</h2>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-400">
                    Purse Left: <PriceDisplay amount={purse.remaining} size="sm" />
                  </span>
                  <span className="text-gray-400">
                    {purse.playersBought} players
                  </span>
                </div>
              </div>
            </div>

            {players.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {players.map((sp) => (
                  <div key={sp.playerId} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded">
                    <div className="flex-1">
                      <p className="text-sm text-white">{sp.player?.name ?? sp.playerId}</p>
                      {sp.player && <RoleBadge role={sp.player.role as PlayerRole} size="sm" />}
                    </div>
                    <PriceDisplay amount={sp.price} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No players bought</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
