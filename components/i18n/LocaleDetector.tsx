'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LocaleDetector() {
  const pathname = usePathname();

  useEffect(() => {
    // Detect locale from URL path
    const segments = pathname?.split('/').filter(Boolean) || [];
    const locale = segments[0];
    
    if (locale === 'ar' || locale === 'en') {
      // Update the HTML lang and dir attributes
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    } else {
      // Default to English
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}
