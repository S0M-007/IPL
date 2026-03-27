import { cn } from '@/lib/utils';

interface CountryFlagProps {
  country: string;
  isOverseas: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function CountryFlag({ country, isOverseas, size = 'md', className }: CountryFlagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        size === 'sm' ? 'text-xs' : 'text-sm',
        isOverseas ? 'text-amber-400' : 'text-gray-400',
        className
      )}
    >
      {country}
      {isOverseas && (
        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1 rounded">OS</span>
      )}
    </span>
  );
}
