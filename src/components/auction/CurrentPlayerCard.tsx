'use client';

import { getPlayerById } from '@/lib/data';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { CountryFlag } from '@/components/shared/CountryFlag';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { Card } from '@/components/ui/Card';
import type { PlayerRole } from '@/lib/types';

interface CurrentPlayerCardProps {
  playerId: string;
  currentBid: number;
  bidderTeam: string | null;
}

export function CurrentPlayerCard({ playerId, currentBid, bidderTeam }: CurrentPlayerCardProps) {
  const player = getPlayerById(playerId);
  if (!player) return null;

  return (
    <Card variant="elevated" className="p-6 animate-slide-in">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
          {player.name.charAt(0)}
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{player.name}</h2>
        <p className="text-sm text-gray-400 mb-3">{player.specialization}</p>
        <div className="flex items-center justify-center gap-3 mb-4">
          <RoleBadge role={player.role as PlayerRole} size="md" />
          <CountryFlag country={player.country} isOverseas={player.isOverseas} size="md" />
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 mt-4">
          <p className="text-xs text-gray-500 uppercase mb-1">
            {bidderTeam ? 'Current Bid' : 'Base Price'}
          </p>
          <div className={bidderTeam ? 'animate-bid-pulse' : ''}>
            <PriceDisplay amount={currentBid} size="lg" />
          </div>
        </div>
      </div>
    </Card>
  );
}
