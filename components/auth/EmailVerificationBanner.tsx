'use client';

import React from 'react';
import { AlertTriangle, Mail, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/auth';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface EmailVerificationBannerProps {
  onResendEmail?: () => void;
  className?: string;
}

export function EmailVerificationBanner({ 
  onResendEmail,
  className = '' 
}: EmailVerificationBannerProps) {
  const t = useTranslations('common');
  const { user, resendVerificationEmail, isLoading } = useAuthStore();

  // Don't show banner if user is verified or doesn't exist
  if (!user || user.isVerified) {
    return null;
  }

  const handleResendEmail = async () => {
    try {
      await resendVerificationEmail();
      onResendEmail?.();
    } catch (error: any) {
      console.error('Failed to resend verification email:', error);
      toast.error(error.message || t('auth.loginFailed'));
    }
  };

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            {t('auth.verifyEmail')}
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              {t('auth.verifyEmail')}
            </p>
            <p className="mt-1">
              {t('auth.emailVerificationCheck', { default: 'Check your email inbox and spam folder for the verification link.' })}
            </p>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleResendEmail}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="text-amber-700 border-amber-300 hover:bg-amber-100"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2"></div>
                  {t('auth.sending', { default: 'Sending...' })}
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  {t('auth.resendVerificationEmail', { default: 'Resend Verification Email' })}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmailVerificationSuccess({ 
  className = '' 
}: { className?: string }) {
  const t = useTranslations('common');
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            {t('auth.emailVerified', { default: 'Email Verified Successfully' })}
          </h3>
          <p className="mt-1 text-sm text-green-700">
            {t('auth.emailVerifiedDesc', { default: 'Your email address has been verified. You now have access to all features.' })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function EmailVerificationError({ 
  error,
  onRetry,
  className = '' 
}: { 
  error?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const t = useTranslations('common');
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {t('auth.emailVerificationFailed', { default: 'Email Verification Failed' })}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              {error || t('auth.emailVerificationError', { default: 'There was an error verifying your email address.' })}
            </p>
            <p className="mt-1">
              {t('auth.emailVerificationTryAgain', { default: 'Please try again or contact support if the problem persists.' })}
            </p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                <Mail className="h-4 w-4 mr-2" />
                {t('auth.tryAgain', { default: 'Try Again' })}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
