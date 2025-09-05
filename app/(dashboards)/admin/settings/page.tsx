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

export default function AdminSettingsPage() {
  const { isLoading, isAuthenticated } = useAuthStore();

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
      alert('Settings saved successfully! (Demo mode)');
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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600">Configure platform-wide settings and preferences</p>
        </div>
        <Button 
          onClick={handleSave} 
          variant="primary" 
          leftIcon={<Save className="h-4 w-4" />}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Platform Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Name
              </label>
              <Input
                value={settings.platform.name}
                onChange={(e) => updateSetting('platform', 'name', e.target.value)}
                placeholder="Platform name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <Input
                value={settings.platform.domain}
                onChange={(e) => updateSetting('platform', 'domain', e.target.value)}
                placeholder="Domain"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <Input
                type="email"
                value={settings.platform.supportEmail}
                onChange={(e) => updateSetting('platform', 'supportEmail', e.target.value)}
                placeholder="support@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={settings.platform.timezone}
                onChange={(e) => updateSetting('platform', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
              >
                <option value="UTC+5">UTC+5 (Pakistan)</option>
                <option value="UTC+0">UTC+0 (GMT)</option>
                <option value="UTC-5">UTC-5 (EST)</option>
                <option value="UTC-8">UTC-8 (PST)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={settings.platform.language}
                onChange={(e) => updateSetting('platform', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
              >
                <option value="English">English</option>
                <option value="Urdu">Urdu</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={settings.platform.currency}
                onChange={(e) => updateSetting('platform', 'currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
              >
                <option value="AED">AED (د.إ)</option>
                <option value="USD">USD ($)</option>
                <option value="PKR">PKR (₨)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
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
            Security Settings
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
              <label htmlFor="emailVerification" className="ml-2 text-sm text-gray-700">
                Require Email Verification
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="phoneVerification"
                checked={settings.security.requirePhoneVerification}
                onChange={(e) => updateSetting('security', 'requirePhoneVerification', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="phoneVerification" className="ml-2 text-sm text-gray-700">
                Require Phone Verification
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <Input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (hours)
              </label>
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
              <label htmlFor="twoFactorAuth" className="ml-2 text-sm text-gray-700">
                Enable Two-Factor Authentication
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
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
              <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
                Email Notifications
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smsNotifications"
                checked={settings.notifications.smsNotifications}
                onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="smsNotifications" className="ml-2 text-sm text-gray-700">
                SMS Notifications
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pushNotifications"
                checked={settings.notifications.pushNotifications}
                onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="pushNotifications" className="ml-2 text-sm text-gray-700">
                Push Notifications
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="adminAlerts"
                checked={settings.notifications.adminAlerts}
                onChange={(e) => updateSetting('notifications', 'adminAlerts', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="adminAlerts" className="ml-2 text-sm text-gray-700">
                Admin Alerts
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Business Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Withdrawal Amount
              </label>
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
              <label htmlFor="autoApproveSellers" className="ml-2 text-sm text-gray-700">
                Auto-approve Seller Applications
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireBusinessLicense"
                checked={settings.business.requireBusinessLicense}
                onChange={(e) => updateSetting('business', 'requireBusinessLicense', e.target.checked)}
                className="h-4 w-4 text-wrench-accent focus:ring-wrench-accent border-gray-300 rounded"
              />
              <label htmlFor="requireBusinessLicense" className="ml-2 text-sm text-gray-700">
                Require Business License
              </label>
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
              <h4 className="font-medium text-blue-800">Demo Mode</h4>
              <p className="text-sm text-blue-700 mt-1">
                This is a demonstration of the settings interface. In production, these settings would be saved to the database and applied across the platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
