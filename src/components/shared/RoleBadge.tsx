import { cn } from '@/lib/utils';
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/constants';
import type { PlayerRole } from '@/lib/types';

interface RoleBadgeProps {
  role: PlayerRole;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function RoleBadge({ role, size = 'sm', className }: RoleBadgeProps) {
  const colors = ROLE_COLORS[role];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        colors?.bg,
        colors?.text,
        sizeClasses[size],
        className
      )}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}
