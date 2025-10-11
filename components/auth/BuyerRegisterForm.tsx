'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Mail, Lock, Phone, CheckCircle, ArrowLeft, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/stores/auth';
import { buyerRegisterSchema, type BuyerRegisterFormData } from '@/lib/validations/auth';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import { GoogleLoginButton } from './GoogleLoginButton';
import { useTranslations } from 'next-intl';

interface BuyerRegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  onSwitchToSeller?: () => void;
}

export function BuyerRegisterForm({ onSuccess, onSwitchToLogin, onSwitchToSeller }: BuyerRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading, error, clearError, user } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('common.auth');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
  } = useForm<BuyerRegisterFormData>({
    resolver: zodResolver(buyerRegisterSchema),
    defaultValues: {
      role: 'BUYER',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  // Clear auth errors when component mounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const password = watch('password');

  const onSubmit = async (data: BuyerRegisterFormData) => {
    try {
      clearErrors();
      await registerUser(data);
      
      // Show success message with email verification info
      toast.success(t('accountCreatedSuccessfully'));
      
      // Redirect buyer to dashboard (they'll see verification banner)
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
          <ShoppingCart className="h-6 w-6 text-wrench-accent" />
        </div>
        <p className="text-wrench-text-secondary">{t('createAccountToShop')}</p>
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
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
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
            <Lock className={`absolute ${currentLocale === 'ar' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary`} />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('confirmYourPassword')}
              className="pl-10 pr-10"
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
            t('createAccount')
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-wrench-text-secondary">{t('or')}</span>
        </div>
      </div>

      {/* Google Login */}
      <GoogleLoginButton
        onSuccess={onSuccess}
        text={t('continueWithGoogle')}
      />

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
          {t('wantToSell')}{' '}
          <button
            type="button"
            onClick={onSwitchToSeller}
            className="text-wrench-accent hover:text-wrench-accent-hover font-medium"
          >
            {t('registerAsSeller')}
          </button>
        </p>
      </div>
    </div>
  );
}
