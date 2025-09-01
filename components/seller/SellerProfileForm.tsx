'use client';

import { useState, useEffect } from 'react';
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

interface SellerProfileFormProps {
  profile: any;
  isUpdating: boolean;
  onUpdate: (data: any) => void;
  onRefresh: () => void;
}

export function SellerProfileForm({ profile, isUpdating, onUpdate, onRefresh }: SellerProfileFormProps) {
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
    return new Date(dateString).toLocaleDateString('en-US', {
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
          <span className="text-sm font-medium">Account Approved</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Pending Approval</span>
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
                <p className="text-gray-600">Seller ID: {profile.id?.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">Member since {formatDate(profile.createdAt)}</p>
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
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{profile.productCount || 0}</div>
              <div className="text-sm text-blue-700">Products Listed</div>
            </div>
                         <div className="text-center p-4 bg-green-50 rounded-lg">
               <div className="text-2xl font-bold text-green-600">{profile.chatCount || 0}</div>
               <div className="text-sm text-green-700">Total Chats</div>
             </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{profile.serviceCount || 0}</div>
              <div className="text-sm text-purple-700">Services Offered</div>
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
              Business Information
            </CardTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
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
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.firstName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.lastName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      type="email"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shop Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Store className="h-5 w-5 text-green-600" />
                Shop Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.shopName}
                      onChange={(e) => handleInputChange('shopName', e.target.value)}
                      placeholder="Enter your shop name"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.shopName || 'Not provided'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Description
                  </label>
                  {isEditing ? (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wrench-orange-500 focus:border-transparent"
                      rows={3}
                      value={formData.shopDescription}
                      onChange={(e) => handleInputChange('shopDescription', e.target.value)}
                      placeholder="Describe your business and services"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.shopDescription || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Address
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.shopAddress}
                      onChange={(e) => handleInputChange('shopAddress', e.target.value)}
                      placeholder="Enter shop address"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.shopAddress || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      placeholder="Enter area"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.area || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.city || 'Not provided'}</p>
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
                  <h4 className="font-medium text-yellow-800">Account Under Review</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your seller account is currently being reviewed by our team. Please ensure all required information is provided. You'll be notified once your account is approved.
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