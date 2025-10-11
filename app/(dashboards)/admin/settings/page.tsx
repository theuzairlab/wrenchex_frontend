'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Settings, 
  Save, 
  Globe, 
  Shield, 
  Bell, 
  CreditCard,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function AdminSettingsPage() {
  const { isLoading, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('adminSettings');

  const [settings, setSettings] = useState({
    platform: {
      name: 'WrenchEX',
      domain: 'wrenchex.com',
      supportEmail: 'support@wrenchex.com',
      timezone: 'UTC+5',
      language: 'English',
      currency: 'USD'
    },
    security: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      maxLoginAttempts: 5,
      sessionTimeout: 24,
      twoFactorAuth: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminAlerts: true
    },
    business: {
      commissionRate: 5.0,
      minimumWithdrawal: 50.0,
      autoApproveSellers: false,
      requireBusinessLicense: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert(t('settingsSavedSuccessfully'));
    }, 1000);
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('platformSettings')}</h1>
          <p className="text-gray-600">{t('configurePlatformSettings')}</p>
        </div>
        <Button 
          onClick={handleSave} 
          variant="primary" 
          leftIcon={<Save className="h-4 w-4" />}
          disabled={isSaving}
        >
{isSaving ? t('saving') : t('saveSettings')}
        </Button>
      </div>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
{t('platformConfiguration')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
{t('platformName')}
              </label>
              <Input
                value={settings.platform.name}
                onChange={(e) => updateSetting('platform', 'name', e.target.value)}
                placeholder={t('platformNamePlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
{t('domain')}
              </label>
              <Input
                value={settings.platform.domain}
                onChange={(e) => updateSetting('platform', 'domain', e.target.value)}
                placeholder={t('domainPlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('supportEmail')}
              </label>
              <Input
                type="email"
                value={settings.platform.supportEmail}
                onChange={(e) => updateSetting('platform', 'supportEmail', e.target.value)}
                placeholder={t('supportEmailPlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('timezone')}
              </label>
              <select
                value={settings.platform.timezone}
                onChange={(e) => updateSetting('platform', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
              >
                <option value="UTC+5">{t('timezoneUTC5')}</option>
                <option value="UTC+0">{t('timezoneUTC0')}</option>
                <option value="UTC-5">{t('timezoneUTC5EST')}</option>
                <option value="UTC-8">{t('timezoneUTC8PST')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('language')}
              </label>
              <select
                value={settings.platform.language}
                onChange={(e) => updateSetting('platform', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
              >
                <option value="English">{t('english')}</option>
                <option value="Urdu">{t('urdu')}</option>
                <option value="Arabic">{t('arabic')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('currency')}</label>
              <select
                value={settings.platform.currency}
                onChange={(e) => updateSetting('platform', 'currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
              >
                <option value="AED">{t('currencyAED')}</option>
                <option value="USD">{t('currencyUSD')}</option>
                <option value="PKR">{t('currencyPKR')}</option>
                <option value="EUR">{t('currencyEUR')}</option>
                <option value="GBP">{t('currencyGBP')}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('securitySettings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailVerification"
                checked={settings.security.requireEmailVerification}
                onChange={(e) => updateSetting('security', 'requireEmailVerification', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="emailVerification" className="ml-2 text-sm text-gray-700">{t('requireEmailVerification')}</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="phoneVerification"
                checked={settings.security.requirePhoneVerification}
                onChange={(e) => updateSetting('security', 'requirePhoneVerification', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="phoneVerification" className="ml-2 text-sm text-gray-700">{t('requirePhoneVerification')}</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('maxLoginAttempts')}</label>
              <Input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sessionTimeoutHours')}</label>
              <Input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                min="1"
                max="168"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactorAuth"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="twoFactorAuth" className="ml-2 text-sm text-gray-700">{t('enableTwoFactorAuth')}</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('notificationSettings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">{t('emailNotifications')}</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smsNotifications"
                checked={settings.notifications.smsNotifications}
                onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="smsNotifications" className="ml-2 text-sm text-gray-700">{t('smsNotifications')}</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pushNotifications"
                checked={settings.notifications.pushNotifications}
                onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="pushNotifications" className="ml-2 text-sm text-gray-700">{t('pushNotifications')}</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="adminAlerts"
                checked={settings.notifications.adminAlerts}
                onChange={(e) => updateSetting('notifications', 'adminAlerts', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="adminAlerts" className="ml-2 text-sm text-gray-700">{t('adminAlerts')}</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('businessSettings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('commissionRate')}</label>
              <Input
                type="number"
                step="0.1"
                value={settings.business.commissionRate}
                onChange={(e) => updateSetting('business', 'commissionRate', parseFloat(e.target.value))}
                min="0"
                max="50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('minWithdrawalAmount')}</label>
              <Input
                type="number"
                step="0.01"
                value={settings.business.minimumWithdrawal}
                onChange={(e) => updateSetting('business', 'minimumWithdrawal', parseFloat(e.target.value))}
                min="0"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoApproveSellers"
                checked={settings.business.autoApproveSellers}
                onChange={(e) => updateSetting('business', 'autoApproveSellers', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="autoApproveSellers" className="ml-2 text-sm text-gray-700">{t('autoApproveSellers')}</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireBusinessLicense"
                checked={settings.business.requireBusinessLicense}
                onChange={(e) => updateSetting('business', 'requireBusinessLicense', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="requireBusinessLicense" className="ml-2 text-sm text-gray-700">{t('requireBusinessLicense')}</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">{t('demoMode')}</h4>
              <p className="text-sm text-blue-700 mt-1">{t('demoModeDesc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
