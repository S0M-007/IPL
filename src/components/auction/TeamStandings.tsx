import { Card } from '@/components/ui/Card';
import { TeamLogo } from '@/components/shared/TeamLogo';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { TOTAL_PURSE } from '@/lib/constants';
import type { TeamPurse } from '@/lib/types';

interface TeamStandingsProps {
  purses: Record<string, TeamPurse>;
}

export function TeamStandings({ purses }: TeamStandingsProps) {
  const teams = Object.values(purses).sort((a, b) => b.remaining - a.remaining);

  return (
    <div className="space-y-2">
      {teams.map((purse) => (
        <Card key={purse.teamId} variant="default" className="p-3">
          <div className="flex items-center gap-3">
            <TeamLogo teamId={purse.teamId} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <PriceDisplay amount={purse.remaining} size="sm" />
                <span className="text-xs text-gray-500">
                  {purse.playersBought} players
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1">
                <div
                  className="h-1 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${(purse.remaining / TOTAL_PURSE) * 100}%` }}
                />
              </div>
              {purse.overseasCount > 0 && (
                <p className="text-[10px] text-amber-400 mt-1">
                  OS: {purse.overseasCount}/8
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
