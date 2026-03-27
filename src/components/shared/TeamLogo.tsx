import { cn } from '@/lib/utils';
import teamsData from '@/data/teams.json';
import type { Team } from '@/lib/types';

interface TeamLogoProps {
  teamId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

export function TeamLogo({ teamId, size = 'md', className }: TeamLogoProps) {
  const team = (teamsData as Team[]).find((t) => t.id === teamId);
  if (!team) return null;

  const isDark = team.id === 'csk';

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold shrink-0',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: team.primaryColor,
        color: isDark ? '#1a1a1a' : '#ffffff',
      }}
    >
      {team.shortName}
    </div>
  );
}
