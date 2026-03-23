import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('rounded-xl border border-gray-800 bg-gray-900 p-4', className)}>
      {children}
    </div>
  );
}
