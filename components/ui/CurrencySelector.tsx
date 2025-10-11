'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CurrencyService, CurrencyInfo, CountryCurrencyInfo } from '@/lib/services/currencyService';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  value?: string;
  onChange: (currency: CurrencyInfo) => void;
  placeholder?: string;
  className?: string;
  showSearch?: boolean;
  showFlag?: boolean;
  disabled?: boolean;
}

export function CurrencySelector({
  value,
  onChange,
  placeholder = "Select currency",
  className,
  showSearch = true,
  showFlag = false,
  disabled = false
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currencies, setCurrencies] = useState<CountryCurrencyInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyInfo | null>(null);

  // Load currencies on mount
  useEffect(() => {
    const loadCurrencies = async () => {
      setLoading(true);
      try {
        const mappings = await CurrencyService.getAllMappings();
        setCurrencies(mappings);
      } catch (error) {
        console.error('Error loading currencies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrencies();
  }, []);

  // Set selected currency when value changes
  useEffect(() => {
    if (value && currencies.length > 0) {
      const currency = currencies.find(c => c.currency.code === value);
      if (currency) {
        setSelectedCurrency(currency.currency);
      }
    }
  }, [value, currencies]);

  // Filter currencies based on search query
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) {
      return currencies;
    }

    const query = searchQuery.toLowerCase();
    return currencies.filter(currency => 
      currency.countryName.toLowerCase().includes(query) ||
      currency.currency.name.toLowerCase().includes(query) ||
      currency.currency.code.toLowerCase().includes(query)
    );
  }, [currencies, searchQuery]);

  // Get unique currencies (remove duplicates)
  const uniqueCurrencies = useMemo(() => {
    const seen = new Set<string>();
    return filteredCurrencies.filter(currency => {
      if (seen.has(currency.currency.code)) {
        return false;
      }
      seen.add(currency.currency.code);
      return true;
    });
  }, [filteredCurrencies]);

  const handleCurrencySelect = (currency: CurrencyInfo) => {
    setSelectedCurrency(currency);
    onChange(currency);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getCountryFlag = (countryCode: string): string => {
    // Simple flag emoji mapping for common countries
    const flagMap: Record<string, string> = {
      'AE': '🇦🇪',
      'SA': '🇸🇦',
      'KW': '🇰🇼',
      'QA': '🇶🇦',
      'BH': '🇧🇭',
      'OM': '🇴🇲',
      'PK': '🇵🇰',
      'IN': '🇮🇳',
      'BD': '🇧🇩',
      'LK': '🇱🇰',
      'US': '🇺🇸',
      'GB': '🇬🇧',
      'DE': '🇩🇪',
      'FR': '🇫🇷',
      'IT': '🇮🇹',
      'ES': '🇪🇸',
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'SG': '🇸🇬',
      'MY': '🇲🇾',
      'TH': '🇹🇭',
      'PH': '🇵🇭',
      'ID': '🇮🇩',
      'VN': '🇻🇳',
      'KR': '🇰🇷',
      'JP': '🇯🇵',
      'CN': '🇨🇳'
    };
    return flagMap[countryCode] || '🌍';
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "w-full justify-between text-left font-normal",
          !selectedCurrency && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          {showFlag && selectedCurrency && (
            <span className="text-lg">
              {getCountryFlag(currencies.find(c => c.currency.code === selectedCurrency.code)?.countryCode || '')}
            </span>
          )}
          {selectedCurrency ? (
            <span>
              {selectedCurrency.symbol} {selectedCurrency.code} - {selectedCurrency.name}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {showSearch && (
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search currencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading currencies...
              </div>
            ) : uniqueCurrencies.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'No currencies found' : 'No currencies available'}
              </div>
            ) : (
              uniqueCurrencies.map((currencyInfo) => (
                <button
                  key={currencyInfo.currency.code}
                  type="button"
                  onClick={() => handleCurrencySelect(currencyInfo.currency)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between",
                    selectedCurrency?.code === currencyInfo.currency.code && "bg-blue-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {showFlag && (
                      <span className="text-lg">
                        {getCountryFlag(currencyInfo.countryCode)}
                      </span>
                    )}
                    <div>
                      <div className="font-medium">
                        {currencyInfo.currency.symbol} {currencyInfo.currency.code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {currencyInfo.currency.name}
                      </div>
                    </div>
                  </div>
                  {selectedCurrency?.code === currencyInfo.currency.code && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencySelector;
