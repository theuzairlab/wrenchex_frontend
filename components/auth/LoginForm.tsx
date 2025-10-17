'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/stores/auth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import { GoogleLoginButton } from './GoogleLoginButton';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, onSwitchToRegister, redirectTo = '/dashboard' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, user } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('common.auth');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      
      // Show success message
      toast.success(t('loginSuccessful'));
      
      // Check if email needs verification
      if (user && !user.isVerified) {
        toast.info(t('verifyEmail'));
      }
      
      // Handle redirect based on user role and source
      const redirectPath = getRedirectPath();
      router.push(redirectPath);
      
      onSuccess?.();
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Show user-friendly error message with toast - stays on screen
      const errorMessage = err?.message || t('loginFailed');
      toast.error(errorMessage, {
        duration: 5000, // Show for 5 seconds
        position: 'top-center',
      });
      
      // Modal stays open so user can try again
      // No need to call onSuccess - error happened
    }
  };

  const getRedirectPath = () => {
    // If redirectTo is provided and it's not the default dashboard, use it
    if (redirectTo && redirectTo !== '/dashboard') {
      return redirectTo;
    }
    
    // Redirect based on user role
    if (user?.role === 'SELLER') {
      return '/dashboard/seller';
    } else if (user?.role === 'BUYER') {
      return '/dashboard';
    }else if (user?.role === 'ADMIN') {
      return '/dashboard/admin';
    }
    
    // Default fallback
    return '/dashboard';
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="text-center">
        <p className="text-wrench-text-secondary">{t('signInToAccount')}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-wrench-text-primary">
            {t('password')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('enterPassword')}
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-wrench-accent text-wrench-text-primary hover:bg-wrench-accent-hover"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('signingIn')}
            </>
          ) : (
            t('signIn')
          )}
        </Button>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-wrench-accent hover:text-wrench-accent-hover">
            {t('forgotPassword')}
          </Link>
        </div>
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
        redirectTo={redirectTo}
        text={t('continueWithGoogle')}
      />

      {/* Footer */}
      <div className="text-center space-y-4">
        <p className="text-sm text-wrench-text-secondary">
          {t('dontHaveAccount')}{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-wrench-accent hover:text-wrench-accent-hover font-medium"
          >
            {t('signUpHere')}
          </button>
        </p>
      </div>
    </div>
  );
}
