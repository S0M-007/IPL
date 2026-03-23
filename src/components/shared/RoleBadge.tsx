import { ROLE_LABELS } from '@/lib/utils/constants';

const ROLE_COLORS: Record<string, string> = {
  BAT: 'bg-blue-600',
  BOWL: 'bg-green-600',
  AR: 'bg-purple-600',
  WK: 'bg-amber-600',
};

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-white ${ROLE_COLORS[role] || 'bg-gray-600'} ${className}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}
