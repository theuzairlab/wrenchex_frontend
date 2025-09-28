'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseScrollSpyOptions {
  sectionIds: string[];
  offset?: number;
  throttleMs?: number;
}

export function useScrollSpy({ sectionIds, offset = 100, throttleMs = 100 }: UseScrollSpyOptions) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || '');

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementTop - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [offset]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset + 50; // Add extra offset for better UX

      // Find the section that is currently in view
      let currentSection = sectionIds[0];
      
      for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId);
        if (element) {
          const elementTop = element.offsetTop;
          const elementHeight = element.offsetHeight;
          
          if (scrollPosition >= elementTop && scrollPosition < elementTop + elementHeight) {
            currentSection = sectionId;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    // Throttle scroll events
    let timeoutId: NodeJS.Timeout | null = null;
    const throttledHandleScroll = () => {
      if (timeoutId) return;
      
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, throttleMs);
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [sectionIds, offset, throttleMs]);

  return { activeSection, scrollToSection };
}
