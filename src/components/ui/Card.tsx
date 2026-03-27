import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'glass';

interface CardProps {
  teamColor?: string;
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-gray-900 border border-gray-800 rounded-xl',
  elevated: 'bg-gray-900 border border-gray-800 rounded-xl shadow-lg shadow-black/20',
  glass: 'glass rounded-xl',
};

export function Card({ teamColor, variant = 'default', className, children }: CardProps) {
  return (
    <div
      className={cn(variantClasses[variant], teamColor && 'border-l-4', className)}
      style={teamColor ? { borderLeftColor: teamColor } : undefined}
    >
      {children}
    </div>
  );
}
