import React from 'react';
import { cn } from './Button';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'pink' | 'default';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', dot, children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-800 text-gray-300 border border-gray-700',
      success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      error: 'bg-red-500/10 text-red-400 border border-red-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      pink: 'bg-bilibili-pink/10 text-bilibili-pink border border-bilibili-pink/20',
    };

    const dotColors = {
      default: 'bg-gray-400',
      success: 'bg-emerald-400',
      error: 'bg-red-400',
      warning: 'bg-amber-400',
      info: 'bg-blue-400',
      pink: 'bg-bilibili-pink',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variants[variant],
          className
        )}
        {...props}
      >
        {dot && (
          <div className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', dotColors[variant])} />
        )}
        {children}
      </div>
    );
  }
);
Badge.displayName = 'Badge';
