'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthModal } from './AuthModal';
import { LoginForm } from './LoginForm';
import { BuyerRegisterForm } from './BuyerRegisterForm';
import { SellerRegisterForm } from './SellerRegisterForm';

type AuthModalType = 'login' | 'buyer-register' | 'seller-register' | null;

interface AuthModalManagerProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: AuthModalType;
}

export function AuthModalManager({ isOpen, onClose, initialType = 'login' }: AuthModalManagerProps) {
  const [currentType, setCurrentType] = useState<AuthModalType>(initialType);
  const pathname = usePathname();

  const handleClose = () => {
    setCurrentType(initialType);
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
  };

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

  const getModalTitle = () => {
    switch (currentType) {
      case 'login':
        return 'Welcome Back';
      case 'buyer-register':
        return 'Join as Customer';
      case 'seller-register':
        return 'Join as Seller';
      default:
        return '';
    }
  };

  const renderForm = () => {
    const redirectPath = getRedirectPath();
    
    switch (currentType) {
      case 'login':
        return (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setCurrentType('buyer-register')}
            redirectTo={redirectPath}
          />
        );
      case 'buyer-register':
        return (
          <BuyerRegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setCurrentType('login')}
            onSwitchToSeller={() => setCurrentType('seller-register')}
          />
        );
      case 'seller-register':
        return (
          <SellerRegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setCurrentType('login')}
            onSwitchToBuyer={() => setCurrentType('buyer-register')}
          />
        );
      default:
        return null;
    }
  };

  const getModalSize = () => {
    switch (currentType) {
      case 'login':
        return 'max-w-md';
      case 'buyer-register':
      case 'seller-register':
        return 'max-w-2xl';
      default:
        return 'max-w-md';
    }
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
      className={getModalSize()}
    >
      {renderForm()}
    </AuthModal>
  );
}
