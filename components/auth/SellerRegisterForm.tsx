'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Eye, EyeOff, User, Mail, Lock, Phone, CheckCircle, ArrowLeft, Store, 
  MapPin, Building, FileText, AlertCircle, Loader2, Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  sellerRegisterSchema, 
  type SellerRegisterFormData, 
  businessTypeOptions,
  shopRoleOptions
} from '@/lib/validations/auth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import AddressInput from '@/components/location/AddressInput';
import { HierarchicalLocationPicker } from '@/components/location/HierarchicalLocationPicker';
import { LocationData } from '@/lib/services/locationService';
import { useTranslations } from 'next-intl';

interface SellerRegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  onSwitchToBuyer?: () => void;
}

export function SellerRegisterForm({ onSuccess, onSwitchToLogin, onSwitchToBuyer }: SellerRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [useHierarchicalPicker, setUseHierarchicalPicker] = useState(true);
  const { register: registerUser, isLoading, error, clearError, user } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('common.auth');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

  // Toast on hierarchical location confirm
  useEffect(() => {
    const handler = () => {
      toast.success(t('locationDetected'));
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('seller-location-confirmed', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('seller-location-confirmed', handler as EventListener);
      }
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
    setValue,
  } = useForm<SellerRegisterFormData>({
    resolver: zodResolver(sellerRegisterSchema),
    defaultValues: {
      role: 'SELLER',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      shopName: '',
      shopAddress: '',
      city: '',
      area: '',
      latitude: undefined,
      longitude: undefined,
      businessType: '',
      shopRole: '',
      customShopRole: '',
      description: '',
    },
  });

  // Clear auth errors when component mounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const password = watch('password');
  const shopRole = watch('shopRole');

  // Handle location change from address input
  const handleLocationChange = (location: LocationData | null) => {
    setLocationData(location);
    if (location) {
      // Update form values with location data
      if (location.city) {
        setValue('city', location.city);
      }
      if (location.area) {
        setValue('area', location.area);
      }
      if (location.latitude) {
        setValue('latitude', location.latitude);
      }
      if (location.longitude) {
        setValue('longitude', location.longitude);
      }
    }
  };

  const onSubmit = async (data: SellerRegisterFormData) => {
    try {
      clearErrors();
      
      // Prepare submission data
      const submissionData: any = {
        ...data,
        latitude: locationData?.latitude || data.latitude,
        longitude: locationData?.longitude || data.longitude,
        city: locationData?.city || data.city,
        area: locationData?.area || data.area,
      };

      // Only include customShopRole if shopRole is 'other'
      if (data.shopRole !== 'other') {
        delete submissionData.customShopRole;
      }
      
      console.log('SellerRegisterForm: Submitting data:', {
        ...submissionData,
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });
      
      await registerUser(submissionData);
      
      // Show success message with email verification info
      toast.success(t('sellerAccountCreatedSuccessfully'));
      
      // Redirect seller to seller dashboard (they'll see verification banner)
      router.push('/dashboard');
      
      onSuccess?.();
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Show user-friendly error message
      const errorMessage = err?.message || t('registrationFailed');
      toast.error(errorMessage);
      
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-wrench-accent/10 rounded-full mx-auto mb-4">
          <Store className="h-6 w-6 text-wrench-accent" />
        </div>
        <p className="text-wrench-text-secondary">{t('startBusinessJourney')}</p>
      </div>

      {/* Error Message */}
      {(error || errors.root) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error || errors.root?.message}</span>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-wrench-text-primary">
              {t('firstName')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
              <Input
                id="firstName"
                type="text"
                placeholder={t('firstName')}
                className="pl-10"
                autoComplete="given-name"
                {...register('firstName')}
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-wrench-text-primary">
              {t('lastName')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
              <Input
                id="lastName"
                type="text"
                placeholder={t('lastName')}
                className="pl-10"
                autoComplete="family-name"
                {...register('lastName')}
              />
            </div>
            {errors.lastName && (
              <p className="text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-wrench-text-primary">
            {t('emailAddress')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
            <Input
              id="email"
              type="email"
              placeholder={t('enterEmail')}
              className="pl-10"
              autoComplete="email"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-wrench-text-primary">
            {t('phoneNumber')}
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
            <Input
              id="phone"
              type="tel"
              placeholder={t('enterPhoneNumber')}
              className="pl-10"
              autoComplete="tel"
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Shop Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="shopName" className="text-sm font-medium text-wrench-text-primary">
              {t('shopName')}
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
              <Input
                id="shopName"
                type="text"
                placeholder={t('enterShopName')}
                className="pl-10"
                autoComplete="organization"
                {...register('shopName')}
              />
            </div>
            {errors.shopName && (
              <p className="text-sm text-red-600">{errors.shopName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="businessType" className="text-sm font-medium text-wrench-text-primary">
              {t('businessType')}
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
              <select
                id="businessType"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent"
                autoComplete="off"
                {...register('businessType')}
              >
                <option value="">{t('selectBusinessType')}</option>
                {businessTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.businessType && (
              <p className="text-sm text-red-600">{errors.businessType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="shopRole" className="text-sm font-medium text-wrench-text-primary">
              {t('shopRole')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
              <select
                id="shopRole"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent"
                autoComplete="off"
                {...register('shopRole')}
              >
                <option value="">{t('selectShopRole')}</option>
                {shopRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.shopRole && (
              <p className="text-sm text-red-600">{errors.shopRole.message}</p>
            )}
          </div>

          {/* Custom Shop Role Input - Only show when "Other" is selected */}
          {shopRole === 'other' && (
            <div className="space-y-2">
              <label htmlFor="customShopRole" className="text-sm font-medium text-wrench-text-primary">
                {t('customShopRole')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
                <Input
                  id="customShopRole"
                  type="text"
                  placeholder={t('enterCustomShopRole')}
                  className="pl-10"
                  autoComplete="off"
                  {...register('customShopRole')}
                />
              </div>
              {errors.customShopRole && (
                <p className="text-sm text-red-600">{errors.customShopRole.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Location Selection Method Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-wrench-text-primary">
              {t('shopLocation')} *
            </label>
            <button
              type="button"
              onClick={() => setUseHierarchicalPicker(!useHierarchicalPicker)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {useHierarchicalPicker ? t('useSimpleAddressInput') : t('useStepByStepSelection')}
            </button>
          </div>

          {useHierarchicalPicker ? (
            /* Zameen.com Style Hierarchical Picker */
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>{t('selectLocationStepByStep')}</span>
              </div>
              <HierarchicalLocationPicker
                onLocationSelect={(location) => {
                  setValue('shopAddress', location.address);
                  handleLocationChange(location);
                }}
                defaultCity={locationData?.city || ''}
                defaultArea={locationData?.area || ''}
                defaultAddress={watch('shopAddress') || ''}
              />
            </div>
          ) : (
            /* Original Address Input */
            <div className="space-y-2">
              <AddressInput
                value={watch('shopAddress')}
                onChange={(value) => setValue('shopAddress', value)}
                onLocationChange={handleLocationChange}
                placeholder={t('enterCompleteShopAddress')}
                error={errors.shopAddress?.message}
                required
                showCurrentLocationButton={true}
                showMapPinButton={true}
                requireActivation={true}
              />
              <p className="text-xs text-gray-500">
                {t('locationHelpText')}
              </p>
            </div>
          )}
        </div>

        {/* City and Area - Auto-filled but editable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium text-wrench-text-primary">
              {t('city')} *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
              <Input
                id="city"
                type="text"
                placeholder={t('cityName')}
                className="pl-10"
                autoComplete="address-level2"
                {...register('city')}
              />
            </div>
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="area" className="text-sm font-medium text-wrench-text-primary">
              {t('area')} *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
              <Input
                id="area"
                type="text"
                placeholder={t('areaDistrict')}
                className="pl-10"
                autoComplete="address-level3"
                {...register('area')}
              />
            </div>
            {errors.area && (
              <p className="text-sm text-red-600">{errors.area.message}</p>
            )}
          </div>
        </div>

        {/* Location Status Indicator */}
        {locationData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-700">
              <Navigation className="h-4 w-4" />
              <span className="text-sm font-medium">{t('locationDetected')}</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {t('coordinates')}: {locationData.latitude?.toFixed(6)}, {locationData.longitude?.toFixed(6)}
            </p>
          </div>
        )}


        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-wrench-text-primary">
            {t('businessDescription')}
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-wrench-text-secondary" />
            <textarea
              id="description"
              placeholder={t('describeBusinessAndServices')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-wrench-accent resize-none"
              rows={3}
              autoComplete="off"
              {...register('description')}
            />
          </div>
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-wrench-text-primary">
            {t('password')}
          </label>
          <div className="relative">
            <Lock className={`absolute ${currentLocale === 'ar' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary`} />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('createPassword')}
              className="pl-10 pr-10"
              autoComplete="new-password"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${currentLocale === 'ar' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-wrench-text-secondary hover:text-wrench-text-primary ${showPassword ? 'text-wrench-text-primary' : 'text-wrench-text-secondary'}`}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-wrench-text-primary">
            {t('confirmPassword')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('confirmYourPassword')}
              className="pl-10 pr-10"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute ${currentLocale === 'ar' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-wrench-text-secondary hover:text-wrench-text-primary ${showConfirmPassword ? 'text-wrench-text-primary' : 'text-wrench-text-secondary'}`}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-wrench-accent text-wrench-text-primary hover:bg-wrench-accent-hover"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('creatingAccount')}
            </>
          ) : (
            t('createSellerAccount')
          )}
        </Button>
      </form>


      {/* Footer */}
      <div className="text-center space-y-4">
        <p className="text-sm text-wrench-text-secondary">
          {t('dontHaveAccount')}{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-wrench-accent hover:text-wrench-accent-hover font-medium"
          >
            {t('signInHere')}
          </button>
        </p>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-wrench-text-secondary">{t('or')}</span>
          </div>
        </div>

        <p className="text-sm text-wrench-text-secondary">
          {t('wantToShopInstead')}{' '}
          <button
            type="button"
            onClick={onSwitchToBuyer}
            className="text-wrench-accent hover:text-wrench-accent-hover font-medium"
          >
            {t('registerAsCustomer')}
          </button>
        </p>
      </div>
    </div>
  );
}
