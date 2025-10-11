'use client';

import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@/lib/stores/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  width?: string;
  disabled?: boolean;
}

export function GoogleLoginButton({ 
  onSuccess, 
  onError, 
  redirectTo = '/dashboard',
  text = 'Continue with Google',
  size = 'large',
  width = '100%',
  disabled = false
}: GoogleLoginButtonProps) {
  const { googleLogin, isLoading } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('common.auth');

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      console.log('GoogleLoginButton: Google credential received');
      
      // Call the auth store's google login method
      await googleLogin(credentialResponse.credential);
      
      // Show success message
      toast.success(t('googleLoginSuccessful'));
      
      // Handle redirect based on user role and source
      const redirectPath = getRedirectPath();
      router.push(redirectPath);
      
      onSuccess?.();
    } catch (error: any) {
      console.error('GoogleLoginButton: Google login failed:', error);
      
      const errorMessage = error?.message || t('googleLoginFailed');
      toast.error(errorMessage);
      
      onError?.(errorMessage);
    }
  };

  const handleError = () => {
    const errorMessage = 'Google login was cancelled or failed';
    console.error('GoogleLoginButton: Google login error');
    toast.error(errorMessage);
    onError?.(errorMessage);
  };

  const getRedirectPath = () => {
    // If redirectTo is provided and it's not the default dashboard, use it
    if (redirectTo && redirectTo !== '/dashboard') {
      return redirectTo;
    }
    
    // For Google login, we'll redirect to dashboard and let the auth store handle role-based routing
    // The user role will be determined after successful authentication
    return '/dashboard';
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        width={width}
        size={size}
        text="continue_with"
        shape="rectangular"
        theme="outline"
        logo_alignment="left"
        locale="en"
        auto_select={false}
        cancel_on_tap_outside={true}
        context="signin"
        state_cookie_domain="localhost"
        ux_mode="popup"
        itp_support={true}
      />
      
      {isLoading && (
        <div className="flex items-center justify-center mt-2 text-sm text-wrench-text-secondary">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in with Google...
        </div>
      )}
    </div>
  );
}
