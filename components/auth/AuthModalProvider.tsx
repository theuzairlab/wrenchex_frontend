'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthModalManager } from './AuthModalManager';

type AuthModalType = 'login' | 'buyer-register' | 'seller-register' | null;

interface AuthModalContextType {
  isOpen: boolean;
  modalType: AuthModalType;
  openAuthModal: (type: AuthModalType) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<AuthModalType>('login');
  const pathname = usePathname();

  const openAuthModal = (type: AuthModalType) => {
    setModalType(type);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
  };

  // Close modal automatically when navigating to standalone auth pages
  // like forgot-password or reset-password so the page content is visible
  useEffect(() => {
    if (pathname?.includes('/forgot-password') || pathname?.includes('/reset-password')) {
      setIsOpen(false);
    }
  }, [pathname]);

  // Get redirect path based on current page
  const getRedirectPath = () => {
    // If user is on a product or service page, redirect back there
    if (pathname.includes('/products/') || pathname.includes('/services/')) {
      return pathname;
    }
    
    // If user is on search results, redirect back there
    if (pathname.includes('/search')) {
      return pathname;
    }
    
    // Default to dashboard (will be overridden by role-based logic in forms)
    return '/dashboard';
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, modalType, openAuthModal, closeAuthModal }}>
      {children}
      <AuthModalManager
        isOpen={isOpen}
        onClose={closeAuthModal}
        initialType={modalType}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
