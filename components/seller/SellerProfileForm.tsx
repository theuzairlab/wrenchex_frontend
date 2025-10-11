'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  User, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Edit,
  Save,
  X,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SellerProfileFormProps {
  profile: any;
  isUpdating: boolean;
  onUpdate: (data: any) => void;
  onRefresh: () => void;
}

export function SellerProfileForm({ profile, isUpdating, onUpdate, onRefresh }: SellerProfileFormProps) {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('sellerProfileForm');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    shopName: profile.shopName || '',
    shopDescription: profile.shopDescription || '',
    shopAddress: profile.shopAddress || '',
    city: profile.city || '',
    area: profile.area || '',
    phone: profile.phone || '',
    email: profile.email || '',
    firstName: profile.firstName || '',
    lastName: profile.lastName || ''
  });

  // Update form data when profile changes
  useEffect(() => {
    setFormData({
      shopName: profile.shopName || '',
      shopDescription: profile.shopDescription || '',
      shopAddress: profile.shopAddress || '',
      city: profile.city || '',
      area: profile.area || '',
      phone: profile.phone || '',
      email: profile.email || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || ''
    });
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Only send fields that have actual values (not empty strings)
    const updateData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value && value.trim() !== '')
    );
    
    // Always include required fields if they exist in the original profile
    if (profile.shopAddress && !updateData.shopAddress) {
      updateData.shopAddress = profile.shopAddress;
    }
    if (profile.area && !updateData.area) {
      updateData.area = profile.area;
    }
    if (profile.city && !updateData.city) {
      updateData.city = profile.city;
    }
    
    onUpdate(updateData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original profile values
    setFormData({
      shopName: profile.shopName || '',
      shopDescription: profile.shopDescription || '',
      shopAddress: profile.shopAddress || '',
      city: profile.city || '',
      area: profile.area || '',
      phone: profile.phone || '',
      email: profile.email || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLocale === 'ar' ? 'ar-AE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getApprovalStatus = () => {
    if (profile.isApproved) {
      return (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{t('accountApproved')}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{t('pendingApproval')}</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="border-l-4 border-l-wrench-orange-500">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-wrench-orange-400 to-wrench-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profile.shopName?.charAt(0).toUpperCase() || 'S'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.shopName}</h2>
                <p className="text-gray-600">{t('sellerId')}: {profile.id?.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">{t('memberSince')} {formatDate(profile.createdAt)}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {getApprovalStatus()}
              <Button
                variant="outline"
                onClick={onRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t('refresh')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{profile.productCount || 0}</div>
              <div className="text-sm text-blue-700">{t('productsListed')}</div>
            </div>
                         <div className="text-center p-4 bg-green-50 rounded-lg">
               <div className="text-2xl font-bold text-green-600">{profile.chatCount || 0}</div>
               <div className="text-sm text-green-700">{t('totalChats')}</div>
             </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{profile.serviceCount || 0}</div>
              <div className="text-sm text-purple-700">{t('servicesOffered')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {t('businessInformation')}
            </CardTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {t('editProfile')}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isUpdating ? t('saving') : t('saveChanges')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                {t('personalInformation')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('firstName')}
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder={t('enterFirstName')}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.firstName || t('notProvided')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('lastName')}
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder={t('enterLastName')}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.lastName || t('notProvided')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('emailAddress')}
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('enterEmailAddress')}
                      type="email"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email || t('notProvided')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phoneNumber')}
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder={t('enterPhoneNumber')}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone || t('notProvided')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shop Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Store className="h-5 w-5 text-green-600" />
                {t('shopInformation')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('shopName')} *
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.shopName}
                      onChange={(e) => handleInputChange('shopName', e.target.value)}
                      placeholder={t('enterShopName')}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.shopName || t('notProvided')}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('shopDescription')}
                  </label>
                  {isEditing ? (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-orange-500 focus:border-transparent"
                      rows={3}
                      value={formData.shopDescription}
                      onChange={(e) => handleInputChange('shopDescription', e.target.value)}
                      placeholder={t('describeBusinessAndServices')}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.shopDescription || t('notProvided')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                {t('locationInformation')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('shopAddress')}
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.shopAddress}
                      onChange={(e) => handleInputChange('shopAddress', e.target.value)}
                      placeholder={t('enterShopAddress')}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.shopAddress || t('notProvided')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('area')}
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      placeholder={t('enterArea')}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.area || t('notProvided')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('city')}
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder={t('enterCity')}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.city || t('notProvided')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!profile.isApproved && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">{t('accountUnderReview')}</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {t('accountUnderReviewDescription')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}