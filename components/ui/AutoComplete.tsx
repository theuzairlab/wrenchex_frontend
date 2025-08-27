'use client';

import React, { useState, useRef, useEffect, forwardRef, useMemo } from 'react';
import { Search, X, Check, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Base styles for the autocomplete component
const autoCompleteVariants = cva(
  'relative w-full rounded-lg border text-left transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-300 focus-within:border-wrench-accent focus-within:ring-wrench-accent/20',
        error: 'bg-white border-red-300 focus-within:border-red-500 focus-within:ring-red-500/20',
        success: 'bg-white border-green-300 focus-within:border-green-500 focus-within:ring-green-500/20',
      },
      size: {
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface AutoCompleteOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: React.ReactNode;
  description?: string;
  data?: any;
}

interface AutoCompleteProps extends VariantProps<typeof autoCompleteVariants> {
  options: AutoCompleteOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  allowCustom?: boolean;
  minLength?: number;
  maxSuggestions?: number;
  debounceMs?: number;
  error?: string;
  label?: string;
  hint?: string;
  className?: string;
  dropdownClassName?: string;
  inputClassName?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: AutoCompleteOption) => void;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  filterFunction?: (option: AutoCompleteOption, query: string) => boolean;
  renderOption?: (option: AutoCompleteOption, isHighlighted: boolean) => React.ReactNode;
  renderNoResults?: (query: string) => React.ReactNode;
}

export const AutoComplete = forwardRef<HTMLDivElement, AutoCompleteProps>(({
  options = [],
  value,
  defaultValue = '',
  placeholder = 'Search...',
  disabled = false,
  loading = false,
  clearable = true,
  allowCustom = false,
  minLength = 1,
  maxSuggestions = 10,
  debounceMs = 300,
  variant,
  size,
  error,
  label,
  hint,
  className,
  dropdownClassName,
  inputClassName,
  onChange,
  onSelect,
  onSearch,
  onFocus,
  onBlur,
  filterFunction,
  renderOption,
  renderNoResults,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Use controlled or uncontrolled value
  const currentValue = value !== undefined ? value : inputValue;

  // Default filter function
  const defaultFilter = (option: AutoCompleteOption, query: string): boolean => {
    const searchText = query.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchText) ||
      option.value.toLowerCase().includes(searchText) ||
      (option.description && option.description.toLowerCase().includes(searchText))
    );
  };

  // Filter and limit options
  const filteredOptions = useMemo(() => {
    if (!searchQuery || searchQuery.length < minLength) return [];
    
    const filter = filterFunction || defaultFilter;
    const filtered = options.filter(option => filter(option, searchQuery));
    
    return filtered.slice(0, maxSuggestions);
  }, [options, searchQuery, minLength, maxSuggestions, filterFunction]);

  // Group options
  const groupedOptions = useMemo(() => {
    return filteredOptions.reduce((groups, option) => {
      const group = option.group || 'default';
      if (!groups[group]) groups[group] = [];
      groups[group].push(option);
      return groups;
    }, {} as Record<string, AutoCompleteOption[]>);
  }, [filteredOptions]);

  // Handle input value change
  const handleInputChange = (newValue: string) => {
    if (value === undefined) {
      setInputValue(newValue);
    }
    onChange?.(newValue);
    
    // Update search query with debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setSearchQuery(newValue);
      onSearch?.(newValue);
      setHighlightedIndex(-1);
      
      if (newValue.length >= minLength) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }, debounceMs);
  };

  // Handle option selection
  const handleOptionSelect = (option: AutoCompleteOption) => {
    if (option.disabled) return;
    
    handleInputChange(option.value);
    onSelect?.(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle input focus
  const handleFocus = () => {
    if (currentValue.length >= minLength) {
      setIsOpen(true);
      setSearchQuery(currentValue);
    }
    onFocus?.();
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay closing to allow for option selection
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
      onBlur?.();
    }, 150);
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleInputChange('');
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredOptions.length === 0) {
      if (e.key === 'ArrowDown' && currentValue.length >= minLength) {
        setIsOpen(true);
        setSearchQuery(currentValue);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        } else if (allowCustom && currentValue.trim()) {
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.querySelector(
        `[data-option-index="${highlightedIndex}"]`
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div ref={ref} className="relative" {...props}>
        <div
          ref={containerRef}
          className={cn(
            autoCompleteVariants({ variant: error ? 'error' : variant, size }),
            className
          )}
        >
          <div className="relative flex items-center">
            {/* Search Icon */}
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              className={cn(
                'w-full bg-transparent border-0 focus:outline-none focus:ring-0',
                size === 'sm' && 'px-3 py-2 pl-9 pr-8',
                size === 'md' && 'px-4 py-3 pl-9 pr-10',
                size === 'lg' && 'px-4 py-4 pl-9 pr-10',
                disabled && 'cursor-not-allowed opacity-50',
                inputClassName
              )}
              value={currentValue}
              placeholder={placeholder}
              disabled={disabled}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              role="combobox"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-autocomplete="list"
            />

            {/* Right Icons */}
            <div className="absolute right-3 flex items-center space-x-1">
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              
              {clearable && currentValue && !loading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  <X className="h-3 w-3" />
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
              'absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto',
              dropdownClassName
            )}
            role="listbox"
          >
            {loading ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : Object.keys(groupedOptions).length === 0 ? (
              <div className="py-3 px-3">
                {renderNoResults ? (
                  renderNoResults(searchQuery)
                ) : (
                  <div className="text-sm text-gray-500 text-center">
                    {searchQuery.length < minLength
                      ? `Type at least ${minLength} characters to search`
                      : 'No results found'
                    }
                    {allowCustom && searchQuery.length >= minLength && (
                      <div className="mt-2">
                        <button
                          className="text-wrench-accent hover:text-wrench-accent-hover text-sm font-medium"
                          onClick={() => {
                            handleInputChange(searchQuery);
                            setIsOpen(false);
                          }}
                        >
                          Use "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <div key={group}>
                  {group !== 'default' && (
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
                      {group}
                    </div>
                  )}
                  
                  {groupOptions.map((option, groupIndex) => {
                    const globalIndex = filteredOptions.indexOf(option);
                    const isHighlighted = globalIndex === highlightedIndex;
                    const isSelected = option.value === currentValue;
                    
                    return (
                      <div
                        key={option.value}
                        data-option-index={globalIndex}
                        className={cn(
                          'flex items-center px-3 py-2 cursor-pointer transition-colors',
                          isHighlighted && 'bg-gray-100',
                          isSelected && 'bg-wrench-accent/10 text-wrench-accent-dark',
                          option.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => handleOptionSelect(option)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {renderOption ? (
                          renderOption(option, isHighlighted)
                        ) : (
                          <div className="flex items-center flex-1 min-w-0">
                            {option.icon && (
                              <span className="mr-2 flex-shrink-0">
                                {option.icon}
                              </span>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {option.label}
                              </div>
                              {option.description && (
                                <div className="text-xs text-gray-500 truncate">
                                  {option.description}
                                </div>
                              )}
                            </div>
                            
                            {isSelected && (
                              <Check className="h-4 w-4 text-wrench-accent flex-shrink-0" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
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

AutoComplete.displayName = 'AutoComplete';