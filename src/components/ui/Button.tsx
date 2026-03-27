import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white',
  secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  ghost: 'hover:bg-white/10 text-gray-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...rest}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
