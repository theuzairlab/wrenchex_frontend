'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth';
import { toast } from 'sonner';
// import { useTranslations } from 'next-intl'; // Not needed - using fallback translations

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Detect locale from the URL path
  // The page can be accessed via /en/verify-email or /ar/verify-email
  const currentLocale = pathname?.includes('/ar/') ? 'ar' : 'en';
  
  // Fallback translations in case the namespace is not available
  const fallbackTranslations = {
    emailVerification: 'Email Verification',
    verifyingEmail: 'Verifying your email address...',
    emailVerified: 'Your email has been verified!',
    emailVerificationFailed: 'Email verification failed',
    pleaseWaitVerifying: 'Please wait while we verify your email address...',
    verificationSuccessful: 'Verification Successful!',
    emailSuccessfullyVerified: (email: string) => `Your email ${email} has been successfully verified.`,
    redirectingToDashboard: 'You will be redirected to your dashboard in a few seconds.',
    goToDashboard: 'Go to Dashboard',
    verificationFailed: 'Verification Failed',
    resendVerificationEmail: 'Resend Verification Email',
    backToLogin: 'Back to Login',
    needHelp: 'Need help?',
    checkSpamFolder: 'Check your spam folder or',
    noTokenProvided: 'No verification token provided',
    emailVerifiedSuccessfully: 'Email verified successfully!',
    failedToVerifyEmail: 'Failed to verify email'
  };
  
  // Use fallback translations directly to avoid translation namespace issues
  const safeT = (key: string, params?: any) => {
    const fallback = fallbackTranslations[key as keyof typeof fallbackTranslations];
    if (typeof fallback === 'function') {
      return fallback(params?.email || '');
    }
    return fallback || key;
  };
  const { updateUser } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setErrorMessage(safeT('noTokenProvided'));
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setIsVerifying(true);
      setVerificationStatus('pending');

      const response = await apiClient.post('/auth/verify-email', {
        token: verificationToken
      });

      if (response.success) {
        setVerificationStatus('success');
        setUserEmail(response.data.user.email);
        
        // Update user in store
        updateUser(response.data.user);
        
        toast.success(safeT('emailVerifiedSuccessfully'));
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push(`/${currentLocale}/dashboard`);
        }, 3000);
      } else {
        throw new Error(response.error?.message || safeT('verificationFailed'));
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      setErrorMessage(error.message || safeT('failedToVerifyEmail'));
      toast.error(error.message || safeT('failedToVerifyEmail'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = () => {
    router.push(`/${currentLocale}/auth/login?message=resend-verification`);
  };

  const handleGoToLogin = () => {
    router.push(`/${currentLocale}/auth/login`);
  };

  const handleGoToDashboard = () => {
    router.push(`/${currentLocale}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-blue-600">
            <Mail className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {safeT('emailVerification')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {verificationStatus === 'pending' && safeT('verifyingEmail')}
            {verificationStatus === 'success' && safeT('emailVerified')}
            {verificationStatus === 'error' && safeT('emailVerificationFailed')}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {verificationStatus === 'pending' && (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">
                  {safeT('pleaseWaitVerifying')}
                </p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {safeT('verificationSuccessful')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {safeT('emailSuccessfullyVerified', { email: userEmail })}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {safeT('redirectingToDashboard')}
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={handleGoToDashboard}
                    className="w-full"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {safeT('goToDashboard')}
                  </Button>
                </div>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="text-center">
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {safeT('verificationFailed')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {errorMessage}
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={handleResendEmail}
                    variant="primary"
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {safeT('resendVerificationEmail')}
                  </Button>
                  <Button
                    onClick={handleGoToLogin}
                    variant="outline"
                    className="w-full"
                  >
                    {safeT('backToLogin')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {safeT('needHelp')} {safeT('checkSpamFolder')}{' '}
            <button
              onClick={handleResendEmail}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              {safeT('resendVerificationEmail')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
