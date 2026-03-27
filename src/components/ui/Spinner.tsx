import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}
