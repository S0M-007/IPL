import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
      {
        'bg-gray-700 text-gray-300': variant === 'default',
        'bg-green-900 text-green-300': variant === 'success',
        'bg-yellow-900 text-yellow-300': variant === 'warning',
        'bg-red-900 text-red-300': variant === 'danger',
      },
      className
    )}>
      {children}
    </span>
  );
}
