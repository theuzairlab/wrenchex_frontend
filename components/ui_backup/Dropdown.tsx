'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Base styles for the dropdown trigger
const dropdownTriggerVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-wrench-accent',
        primary: 'bg-wrench-accent text-black hover:bg-wrench-accent-hover focus:ring-wrench-accent',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        outline: 'border border-wrench-accent text-wrench-accent hover:bg-wrench-accent hover:text-black focus:ring-wrench-accent',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  onClick?: () => void;
  href?: string;
  shortcut?: string;
}

interface DropdownProps extends VariantProps<typeof dropdownTriggerVariants> {
  trigger?: React.ReactNode;
  items: DropdownItem[];
  placeholder?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  className?: string;
  dropdownClassName?: string;
  onItemClick?: (item: DropdownItem) => void;
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(({
  trigger,
  items = [],
  placeholder = 'Open menu',
  disabled = false,
  align = 'left',
  variant,
  size,
  className,
  dropdownClassName,
  onItemClick,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle item click
  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    
    item.onClick?.();
    onItemClick?.(item);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        setIsOpen(!isOpen);
        e.preventDefault();
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const defaultTrigger = (
    <button
      type="button"
      className={cn(
        dropdownTriggerVariants({ variant, size }),
        className
      )}
      disabled={disabled}
      onClick={() => setIsOpen(!isOpen)}
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen}
      aria-haspopup="menu"
    >
      {placeholder}
      <ChevronDown
        className={cn(
          'ml-2 h-4 w-4 transition-transform',
          isOpen && 'transform rotate-180'
        )}
      />
    </button>
  );

  return (
    <div ref={ref} className="relative inline-block" {...props}>
      <div ref={dropdownRef}>
        {trigger || defaultTrigger}

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 mt-1 min-w-[200px] bg-white border border-gray-200 rounded-md shadow-lg py-1',
              align === 'right' ? 'right-0' : 'left-0',
              dropdownClassName
            )}
            role="menu"
          >
            {items.map((item, index) => {
              if (item.separator) {
                return (
                  <div key={`separator-${index}`} className="my-1">
                    <div className="h-px bg-gray-200" />
                  </div>
                );
              }

              const ItemComponent = item.href ? 'a' : 'button';

              return (
                <ItemComponent
                  key={item.id}
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-sm text-left transition-colors',
                    'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                    item.disabled && 'opacity-50 cursor-not-allowed',
                    item.danger && 'text-red-600 hover:bg-red-50 focus:bg-red-50'
                  )}
                  disabled={item.disabled}
                  onClick={() => handleItemClick(item)}
                  role="menuitem"
                  {...(item.href && { href: item.href })}
                >
                  {item.icon && (
                    <span className="mr-2 flex-shrink-0">
                      {item.icon}
                    </span>
                  )}
                  
                  <span className="flex-1">{item.label}</span>
                  
                  {item.shortcut && (
                    <span className="ml-2 text-xs text-gray-400">
                      {item.shortcut}
                    </span>
                  )}
                </ItemComponent>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

// Dropdown with custom trigger
export interface DropdownMenuProps extends Omit<DropdownProps, 'trigger'> {
  children: React.ReactNode;
}

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(({
  children,
  ...props
}, ref) => {
  return (
    <Dropdown
      {...props}
      trigger={children}
      ref={ref}
    />
  );
});

DropdownMenu.displayName = 'DropdownMenu';