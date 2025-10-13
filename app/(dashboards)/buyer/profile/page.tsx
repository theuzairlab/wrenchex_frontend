'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { User, Mail, Phone, Save } from 'lucide-react';
import { SocialAccountManager } from '@/components/auth/SocialAccountManager';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { useTranslations } from 'next-intl';

export default function BuyerProfilePage() {
  const { user } = useAuthStore();
  const t = useTranslations('buyerProfile');
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await apiClient.updateProfile(profile);
      
      if (response.success) {
        toast.success(t('profileUpdatedSuccessfully'));
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || t('updateProfileFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="text-blue-600" />
{t('myProfile')}
          </h1>
          <p className="text-gray-600">
{t('managePersonalInfo')}
          </p>
        </div>

        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('personalInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('firstName')}
                </label>
                <Input
                  value={profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder={t('enterFirstName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('lastName')}
                </label>
                <Input
                  value={profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder={t('enterLastName')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                {t('emailAddress')}
              </label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('enterEmail')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                {t('phoneNumber')}
              </label>
              <Input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t('enterPhone')}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                leftIcon={<Save className="h-4 w-4" />}
              >
                {isSaving ? t('saving') : t('saveChanges')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Account Management */}
        <SocialAccountManager />

        {/* Account Settings */}
        {/* <Card>
          <CardHeader>
            <CardTitle>{t('accountSettings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium text-gray-900">{t('emailNotifications')}</h3>
                  <p className="text-sm text-gray-500">{t('emailNotificationsDesc')}</p>
                </div>
                <Button variant="outline" size="sm">
                  {t('configure')}
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h3 className="font-medium text-gray-900">{t('privacySettings')}</h3>
                  <p className="text-sm text-gray-500">{t('privacySettingsDesc')}</p>
                </div>
                <Button variant="outline" size="sm">
                  {t('manage')}
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium text-gray-900">{t('deleteAccount')}</h3>
                  <p className="text-sm text-gray-500">{t('deleteAccountDesc')}</p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                  {t('delete')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </ProtectedRoute>
  );
}
