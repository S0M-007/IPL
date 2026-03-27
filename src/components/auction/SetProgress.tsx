import { SET_NAMES } from '@/lib/constants';

interface SetProgressProps {
  currentSet: number;
  currentIndex: number;
  totalPlayers: number;
}

export function SetProgress({ currentSet, currentIndex, totalPlayers }: SetProgressProps) {
  const setName = SET_NAMES[currentSet] || `Set ${currentSet + 1}`;
  const progress = totalPlayers > 0 ? ((currentIndex + 1) / totalPlayers) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-indigo-400 font-medium">{setName}</span>
        <span className="text-gray-500">
          Player {currentIndex + 1} of {totalPlayers}
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
