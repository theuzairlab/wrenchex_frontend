'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { Check, X, Link, Unlink, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { AccountConflictDialog } from './AccountConflictDialog';

interface SocialAccountManagerProps {
  onAccountConnected?: () => void;
  onAccountDisconnected?: () => void;
}

interface ConnectedAccount {
  provider: 'google' | 'facebook' | 'twitter';
  email: string;
  connectedAt: string;
  isVerified: boolean;
}

export function SocialAccountManager({ 
  onAccountConnected, 
  onAccountDisconnected 
}: SocialAccountManagerProps) {
  const { user, linkGoogleAccount, unlinkSocialAccount, googleLogin } = useAuthStore();
  const t = useTranslations('socialAccountManager');
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictDialog, setConflictDialog] = useState<{
    isOpen: boolean;
    existingAccountRole: 'BUYER' | 'SELLER' | 'ADMIN';
    existingAccountEmail: string;
    pendingIdToken: string | null;
  }>({
    isOpen: false,
    existingAccountRole: 'BUYER',
    existingAccountEmail: '',
    pendingIdToken: null
  });

  useEffect(() => {
    fetchConnectedAccounts();
  }, [user]);

  const fetchConnectedAccounts = async () => {
    try {
      setIsLoading(true);
      
      // For now, we'll check if user has Google ID to determine connected accounts
      // Later this can be expanded to check multiple providers
      const accounts: ConnectedAccount[] = [];
      
      if (user?.googleId) {
        // Use Google email if available, otherwise fall back to user email
        const googleEmail = user.googleEmail || user.email;
        accounts.push({
          provider: 'google',
          email: googleEmail,
          connectedAt: new Date().toISOString(), // This should come from backend
          isVerified: true
        });
      }
      
      setConnectedAccounts(accounts);
    } catch (error) {
      console.error('Failed to fetch connected accounts:', error);
      toast.error(t('loadConnectedAccountsFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleConnect = async (idToken: string) => {
    try {
      setIsConnecting(true);
      setErrorMessage(null); // Clear any previous errors
      
      // Use auth store method to link Google account
      await linkGoogleAccount(idToken);
      
      toast.success('Google account connected successfully!');
      await fetchConnectedAccounts();
      onAccountConnected?.();
    } catch (error: any) {
      console.error('Failed to connect Google account:', error);
      console.log('Error message:', error.message);
      
      // Check if it's an account conflict error
      if (error.message && (error.message.includes('already linked to another user') || error.message.includes('already linked to another account'))) {
        // Show error message in profile page instead of dialog
        setErrorMessage('This Google account is already linked to another account. Please use a different Google account or contact support.');
        return;
      } else if (error.message && error.message.includes('already registered with another user')) {
        setErrorMessage('This Google account email is already registered with another user. Please use a different Google account.');
        return;
      } else {
        setErrorMessage(error.message || t('connectGoogleAccountFailed'));
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectAccount = async (provider: string) => {
    try {
      // Use auth store method to unlink social account
      await unlinkSocialAccount(provider);
      
      toast.success(`${provider} account disconnected successfully!`);
      await fetchConnectedAccounts();
      onAccountDisconnected?.();
    } catch (error: any) {
      console.error('Failed to disconnect account:', error);
      toast.error(error.message || t('disconnectAccountFailed'));
    }
  };

  const handleLoginToExisting = async () => {
    if (conflictDialog.pendingIdToken) {
      try {
        setIsConnecting(true);
        await googleLogin(conflictDialog.pendingIdToken);
        toast.success('Logged into existing account successfully!');
        setConflictDialog({
          isOpen: false,
          existingAccountRole: 'BUYER',
          existingAccountEmail: '',
          pendingIdToken: null
        });
      } catch (error: any) {
        console.error('Failed to login to existing account:', error);
        toast.error(t('loginToExistingAccountFailed'));
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleCancelConflict = () => {
    setConflictDialog({
      isOpen: false,
      existingAccountRole: 'BUYER',
      existingAccountEmail: '',
      pendingIdToken: null
    });
  };

  const isGoogleConnected = connectedAccounts.some(account => account.provider === 'google');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('connectedAccounts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">{t('loadingConnectedAccounts')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('connectedAccounts')}</CardTitle>
          <p className="text-sm text-gray-600">
{t('connectSocialAccountsDesc')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <X className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Google Account */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-50 rounded-full">
                <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{t('google')}</span>
                  {isGoogleConnected && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">{t('connected')}</span>
                    </div>
                  )}
                </div>
                {isGoogleConnected && (
                  <p className="text-sm text-gray-500">
                    {connectedAccounts.find(acc => acc.provider === 'google')?.email}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isGoogleConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnectAccount('google')}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Unlink className="h-4 w-4 mr-1" />
{t('disconnect')}
                </Button>
              ) : (
                <div className="w-48">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      handleGoogleConnect(credentialResponse.credential);
                    }
                  }}
                  onError={() => {
                    toast.error(t('googleLoginCancelledOrFailed'));
                  }}
                  useOneTap={false}
                  width="100%"
                  size="small"
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
                </div>
              )}
            </div>
          </div>

          {/* Account Benefits */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">{t('benefitsOfConnectingAccounts')}</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('fasterLoginWithOneClick')}</li>
              <li>• {t('automaticEmailVerification')}</li>
              <li>• {t('enhancedAccountSecurity')}</li>
              <li>• {t('easyAccountRecovery')}</li>
            </ul>
          </div>

          {/* Security Note */}
          <div className="text-xs text-gray-500">
            <p>
{t('securityNote')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Conflict Dialog */}
      <AccountConflictDialog
        isOpen={conflictDialog.isOpen}
        onClose={handleCancelConflict}
        onLoginToExisting={handleLoginToExisting}
        onCancel={handleCancelConflict}
        existingAccountRole={conflictDialog.existingAccountRole}
        existingAccountEmail={conflictDialog.existingAccountEmail}
      />
    </>
  );
}
