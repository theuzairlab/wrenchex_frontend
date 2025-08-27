'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, Check, X, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Base styles for the select component
const selectVariants = cva(
  'relative w-full cursor-pointer rounded-lg border text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-300 focus:border-wrench-accent focus:ring-wrench-accent/20',
        error: 'bg-white border-red-300 focus:border-red-500 focus:ring-red-500/20',
        success: 'bg-white border-green-300 focus:border-green-500 focus:ring-green-500/20',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-sm',
        lg: 'px-4 py-4 text-base',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed bg-gray-50',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      disabled: false,
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: React.ReactNode;
  description?: string;
}

interface SelectProps extends VariantProps<typeof selectVariants> {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  label?: string;
  hint?: string;
  className?: string;
  dropdownClassName?: string;
  maxHeight?: number;
  onChange?: (value: string | string[]) => void;
  onSearch?: (query: string) => void;
  renderOption?: (option: SelectOption) => React.ReactNode;
  renderValue?: (value: string | string[], options: SelectOption[]) => React.ReactNode;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(({
  options = [],
  value,
  defaultValue,
  placeholder = 'Select an option...',
  searchable = false,
  multiple = false,
  clearable = false,
  loading = false,
  disabled = false,
  error,
  label,
  hint,
  className,
  dropdownClassName,
  maxHeight = 200,
  variant,
  size,
  onChange,
  onSearch,
  renderOption,
  renderValue,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue || (multiple ? [] : '')
  );
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use controlled or uncontrolled value
  const currentValue = value !== undefined ? value : internalValue;

  // Filter options based on search query
  const filteredOptions = searchQuery
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Group options
  const groupedOptions = filteredOptions.reduce((groups, option) => {
    const group = option.group || 'default';
    if (!groups[group]) groups[group] = [];
    groups[group].push(option);
    return groups;
  }, {} as Record<string, SelectOption[]>);

  // Handle value change
  const handleValueChange = (newValue: string | string[]) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  // Handle option selection
  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiple) {
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      const newValue = currentArray.includes(option.value)
        ? currentArray.filter(v => v !== option.value)
        : [...currentArray, option.value];
      handleValueChange(newValue);
    } else {
      handleValueChange(option.value);
      setIsOpen(false);
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleValueChange(multiple ? [] : '');
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setHighlightedIndex(-1);
    onSearch?.(query);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        e.preventDefault();
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        e.preventDefault();
        break;
      case 'ArrowUp':
        if (isOpen) {
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          e.preventDefault();
        }
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Get display value
  const getDisplayValue = () => {
    if (renderValue) {
      return renderValue(currentValue, options);
    }

    if (multiple) {
      const selectedOptions = options.filter(opt =>
        Array.isArray(currentValue) && currentValue.includes(opt.value)
      );
      return selectedOptions.length > 0
        ? selectedOptions.map(opt => opt.label).join(', ')
        : placeholder;
    }

    const selectedOption = options.find(opt => opt.value === currentValue);
    return selectedOption ? selectedOption.label : placeholder;
  };

  // Check if value is selected
  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(currentValue) && currentValue.includes(optionValue);
    }
    return currentValue === optionValue;
  };

  // Check if there's any value
  const hasValue = multiple
    ? Array.isArray(currentValue) && currentValue.length > 0
    : Boolean(currentValue);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div ref={ref} className="relative">
        <div
          ref={selectRef}
          className={cn(
            selectVariants({ variant: error ? 'error' : variant, size, disabled }),
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          {...props}
        >
          <div className="flex items-center justify-between">
            <span className={cn(
              'block truncate',
              !hasValue && 'text-gray-500'
            )}>
              {getDisplayValue()}
            </span>
            
            <div className="flex items-center space-x-1">
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              
              {clearable && hasValue && !loading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded"
                  tabIndex={-1}
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
              
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform',
                  isOpen && 'transform rotate-180'
                )}
              />
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={cn(
              'absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg',
              dropdownClassName
            )}
            style={{ maxHeight }}
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-wrench-accent focus:border-wrench-accent"
                    placeholder="Search options..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="overflow-auto" style={{ maxHeight: maxHeight - (searchable ? 60 : 0) }}>
              {Object.keys(groupedOptions).length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No options found
                </div>
              ) : (
                Object.entries(groupedOptions).map(([group, groupOptions]) => (
                  <div key={group}>
                    {group !== 'default' && (
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                        {group}
                      </div>
                    )}
                    
                    {groupOptions.map((option, index) => {
                      const globalIndex = filteredOptions.indexOf(option);
                      const isHighlighted = globalIndex === highlightedIndex;
                      const selected = isSelected(option.value);
                      
                      return (
                        <div
                          key={option.value}
                          className={cn(
                            'flex items-center px-3 py-2 cursor-pointer transition-colors',
                            selected && 'bg-wrench-accent/10 text-wrench-accent-dark',
                            isHighlighted && 'bg-gray-100',
                            option.disabled && 'opacity-50 cursor-not-allowed'
                          )}
                          onClick={() => handleOptionSelect(option)}
                          role="option"
                          aria-selected={selected}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            {option.icon && (
                              <span className="mr-2 flex-shrink-0">
                                {option.icon}
                              </span>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              {renderOption ? (
                                renderOption(option)
                              ) : (
                                <>
                                  <div className="text-sm font-medium truncate">
                                    {option.label}
                                  </div>
                                  {option.description && (
                                    <div className="text-xs text-gray-500 truncate">
                                      {option.description}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          
                          {selected && (
                            <Check className="h-4 w-4 text-wrench-accent flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error/Hint Messages */}
      {(error || hint) && (
        <div className="text-xs">
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : (
            <span className="text-gray-500">{hint}</span>
          )}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Multi-select convenience component
export const MultiSelect = forwardRef<HTMLDivElement, Omit<SelectProps, 'multiple'>>(
  (props, ref) => <Select {...props} multiple ref={ref} />
);

MultiSelect.displayName = 'MultiSelect';