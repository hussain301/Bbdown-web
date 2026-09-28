import React from 'react';
import { cn } from './Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  iconPrefix?: React.ReactNode;
  iconSuffix?: React.ReactNode;
  multiline?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, label, error, iconPrefix, iconSuffix, multiline, ...props }, ref) => {
    const Component = multiline ? 'textarea' : 'input';
    
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <div className="relative">
          {iconPrefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {iconPrefix}
            </div>
          )}
          {/* @ts-ignore */}
          <Component
            ref={ref as any}
            className={cn(
              'flex w-full rounded-xl border border-gray-800 bg-gray-950/50 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bilibili-pink focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
              iconPrefix && 'pl-10',
              iconSuffix && 'pr-10',
              multiline && 'min-h-[80px]',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            {...props}
          />
          {iconSuffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {iconSuffix}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
