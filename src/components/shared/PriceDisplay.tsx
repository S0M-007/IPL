import { cn } from '@/lib/utils';
import { formatPrice, formatPriceFull } from '@/lib/utils';

interface PriceDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showFull?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl font-bold',
};

export function PriceDisplay({ amount, size = 'md', showFull = false, className }: PriceDisplayProps) {
  const formatted = showFull ? formatPriceFull(amount) : formatPrice(amount);
  return (
    <span className={cn('text-emerald-400', sizeClasses[size], className)}>
      ₹{formatted}
    </span>
  );
}
