'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
      setErrorMessage('No verification token provided');
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
        
        toast.success('Email verified successfully!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        throw new Error(response.error?.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      setErrorMessage(error.message || 'Failed to verify email');
      toast.error(error.message || 'Failed to verify email');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = () => {
    router.push('/auth/login?message=resend-verification');
  };

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-blue-600">
            <Mail className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {verificationStatus === 'pending' && 'Verifying your email address...'}
            {verificationStatus === 'success' && 'Your email has been verified!'}
            {verificationStatus === 'error' && 'Email verification failed'}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {verificationStatus === 'pending' && (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Verification Successful!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your email <span className="font-medium">{userEmail}</span> has been successfully verified.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  You will be redirected to your dashboard in a few seconds.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={handleGoToDashboard}
                    className="w-full"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="text-center">
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Verification Failed
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
                    Resend Verification Email
                  </Button>
                  <Button
                    onClick={handleGoToLogin}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help? Check your spam folder or{' '}
            <button
              onClick={handleResendEmail}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              resend verification email
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
