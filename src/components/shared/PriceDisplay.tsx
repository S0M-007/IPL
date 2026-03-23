import { formatPrice } from '@/lib/utils/price-formatter';

interface PriceDisplayProps {
  lakhs: number;
  className?: string;
  label?: string;
}

export function PriceDisplay({ lakhs, className = '', label }: PriceDisplayProps) {
  return (
    <span className={className}>
      {label && <span className="text-gray-400 mr-1">{label}</span>}
      <span className="text-orange-400 font-semibold">{formatPrice(lakhs)}</span>
    </span>
  );
}
