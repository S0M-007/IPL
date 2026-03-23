interface TeamLogoProps {
  shortName: string;
  primaryColor: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TeamLogo({ shortName, primaryColor, size = 'md', className = '' }: TeamLogoProps) {
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: primaryColor }}
    >
      {shortName}
    </div>
  );
}
