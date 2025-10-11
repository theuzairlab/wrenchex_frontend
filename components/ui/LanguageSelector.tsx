'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Languages, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface LanguageSelectorProps {
  currentLanguage: 'en' | 'ar';
  variant?: 'button' | 'dropdown' | 'compact';
  showLabel?: boolean;
}

export default function LanguageSelector({ 
  currentLanguage, 
  variant = 'dropdown',
  showLabel = true 
}: LanguageSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChanging, setIsChanging] = useState(false);

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'ar' as const, name: 'العربية', flag: '🇸🇦', dir: 'rtl' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = async (newLanguage: 'en' | 'ar') => {
    if (newLanguage === currentLanguage || isChanging) return;

    try {
      setIsChanging(true);
      
      // Update API client language preference
      apiClient.setLanguage(newLanguage);
      
      // Get current path without language prefix
      const pathSegments = pathname.split('/').filter(Boolean);
      const isCurrentlyLocalized = pathSegments[0] === 'en' || pathSegments[0] === 'ar';
      
      let newPath;
      if (isCurrentlyLocalized) {
        // Replace current language with new language
        pathSegments[0] = newLanguage;
        newPath = '/' + pathSegments.join('/');
      } else {
        // Add language prefix to current path
        newPath = `/${newLanguage}${pathname}`;
      }
      
      // Navigate to new path
      router.push(newPath);
      
      // Update document direction for RTL/LTR
      const newLang = languages.find(lang => lang.code === newLanguage);
      if (newLang) {
        document.documentElement.dir = newLang.dir;
        document.documentElement.lang = newLanguage;
      }
      
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  if (variant === 'button') {
    return (
      <div className="flex space-x-2">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            variant={currentLanguage === lang.code ? 'primary' : 'outline'}
            size="sm"
            disabled={isChanging}
            className="flex items-center space-x-1"
          >
            <span>{lang.flag}</span>
            {showLabel && <span>{lang.name}</span>}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Button
        onClick={() => {
          const otherLang = currentLanguage === 'en' ? 'ar' : 'en';
          handleLanguageChange(otherLang);
        }}
        variant="ghost"
        size="sm"
        disabled={isChanging}
        className="flex items-center space-x-1 px-2"
      >
        <span>{currentLang.flag}</span>
        <span className="text-xs font-medium">{currentLang.code.toUpperCase()}</span>
      </Button>
    );
  }

  // Default dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isChanging}
          className="flex items-center space-x-2"
        >
          <Languages className="w-4 h-4" />
          <span>{currentLang.flag}</span>
          {showLabel && <span>{currentLang.name}</span>}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center space-x-2 cursor-pointer ${
              currentLanguage === lang.code ? 'bg-accent' : ''
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
            {currentLanguage === lang.code && (
              <span className="ml-auto text-xs text-accent-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
