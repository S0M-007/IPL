'use client';

import { useAuctionTimer } from '@/hooks/useAuctionTimer';
import { cn } from '@/lib/utils';

interface AuctionTimerProps {
  expiresAt: number | null;
  totalDuration: number;
}

export function AuctionTimer({ expiresAt, totalDuration }: AuctionTimerProps) {
  const { seconds, isUrgent } = useAuctionTimer(expiresAt);

  const progress = expiresAt ? seconds / totalDuration : 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            className="text-gray-800"
            strokeWidth="4"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            className={cn(
              'transition-all duration-200',
              isUrgent ? 'text-red-500' : seconds <= 5 ? 'text-yellow-500' : 'text-indigo-500'
            )}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'text-3xl font-bold',
              isUrgent ? 'animate-countdown-urgent' : 'text-white'
            )}
          >
            {expiresAt ? Math.max(0, seconds) : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}
