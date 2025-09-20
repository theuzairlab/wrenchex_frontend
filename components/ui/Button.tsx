'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'btn-base',
  {
    variants: {
      variant: {
        primary: 'wrench-btn-primary',
        secondary: 'wrench-btn-secondary',
        danger: 'wrench-btn-danger',
        destructive: 'wrench-btn-danger', // Alias for danger
        ghost: 'hover:bg-gray-100 text-gray-600',
        outline: 'border-2 border-[#D4F142] text-black hover:bg-[#D4F142] hover:text-black',
        link: 'text-[#D4F142] hover:text-[#C9E635] underline-offset-4 hover:underline p-0 h-auto font-medium',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-8 text-base',
        xl: 'h-15 px-10 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled, 
    asChild,
    ...props 
  }, ref) => {
    // If asChild is true, pass the styling to the child element
    if (asChild) {
      const child = children as React.ReactElement<any>;
      return React.cloneElement(child, {
        className: cn(buttonVariants({ variant, size, className }), child.props?.className),
        ...props
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex items-center">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2 flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 