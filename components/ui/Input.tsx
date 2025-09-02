import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'input-base',
  {
    variants: {
      variant: {
        default: '',
        error: 'border-wrench-danger focus:border-wrench-danger focus:ring-wrench-danger',
        success: 'border-wrench-success focus:border-wrench-success focus:ring-wrench-success',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-13 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    label, 
    error, 
    hint, 
    leftIcon, 
    rightIcon, 
    required,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isError = Boolean(error);
    const effectiveVariant = isError ? 'error' : variant;

    return (
      <div className="form-group">
        {label && (
          <label 
            htmlFor={inputId}
            className="form-label"
          >
            {label}
            {required && <span className="text-wrench-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10 flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            className={cn(
              inputVariants({ variant: effectiveVariant, size, className }),
              leftIcon && '!pl-10',
              rightIcon && '!pr-10'
            )}
            ref={ref}
            aria-invalid={isError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted z-10 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="form-hint">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants }; 