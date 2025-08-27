// components/ui/Textarea.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label, 
    error, 
    className, 
    ...props 
  }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            className={cn(
              "block mb-2 text-sm font-medium text-gray-700",
              error && "text-red-600"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            className={cn(
              "block w-full px-3 py-2 border rounded-lg text-sm",
              "focus:outline-none focus:ring-2 focus:border-transparent",
              error 
                ? "border-red-500 focus:ring-red-200 text-red-900" 
                : "border-gray-300 focus:ring-wrench-accent-light focus:border-wrench-accent",
              className
            )}
            {...props}
          />
          
          {/* Character Counter (Optional) */}
          {props.maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {props.value ? String(props.value).length : 0} / {props.maxLength}
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="mt-1 text-xs text-red-600 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';