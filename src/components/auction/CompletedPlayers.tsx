import { getPlayerById } from '@/lib/data';
import { TeamLogo } from '@/components/shared/TeamLogo';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { RoleBadge } from '@/components/shared/RoleBadge';
import type { SoldPlayer, PlayerRole } from '@/lib/types';

interface CompletedPlayersProps {
  soldPlayers: SoldPlayer[];
  unsoldPlayers: string[];
}

export function CompletedPlayers({ soldPlayers, unsoldPlayers }: CompletedPlayersProps) {
  return (
    <div className="space-y-4">
      {soldPlayers.length > 0 && (
        <div>
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Sold ({soldPlayers.length})
          </h3>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {[...soldPlayers].reverse().map((sp) => {
              const player = getPlayerById(sp.playerId);
              return (
                <div key={sp.playerId} className="flex items-center gap-2 py-1.5 px-2 bg-gray-800/30 rounded">
                  <TeamLogo teamId={sp.teamId} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{player?.name ?? sp.playerId}</p>
                    {player && <RoleBadge role={player.role as PlayerRole} size="sm" />}
                  </div>
                  <PriceDisplay amount={sp.price} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {unsoldPlayers.length > 0 && (
        <div>
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Unsold ({unsoldPlayers.length})
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {unsoldPlayers.map((pid) => {
              const player = getPlayerById(pid);
              return (
                <div key={pid} className="flex items-center gap-2 py-1.5 px-2 bg-gray-800/30 rounded opacity-60">
                  <p className="text-sm text-gray-400 flex-1 truncate">{player?.name ?? pid}</p>
                  {player && <RoleBadge role={player.role as PlayerRole} size="sm" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
