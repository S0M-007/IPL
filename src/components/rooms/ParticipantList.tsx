import { TeamLogo } from '@/components/shared/TeamLogo';
import { Badge } from '@/components/ui/Badge';
import type { Participant } from '@/lib/types';

interface ParticipantListProps {
  participants: Participant[];
  hostId: string;
}

export function ParticipantList({ participants, hostId }: ParticipantListProps) {
  return (
    <div className="space-y-2">
      {participants.map((p) => (
        <div
          key={p.userId}
          className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
        >
          {p.teamId ? (
            <TeamLogo teamId={p.teamId} size="sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
              ?
            </div>
          )}
          <span className="text-sm text-white flex-1">{p.displayName}</span>
          {p.userId === hostId && (
            <Badge variant="warning" size="sm">Host</Badge>
          )}
        </div>
      ))}
    </div>
  );
}
