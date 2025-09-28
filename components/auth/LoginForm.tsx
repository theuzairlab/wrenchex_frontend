'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/stores/auth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { GoogleLoginButton } from './GoogleLoginButton';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, onSwitchToRegister, redirectTo = '/dashboard' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clear auth errors when component mounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearErrors();
      await login(data.email, data.password);
      
      // Show success message
      toast.success('Login successful! Welcome back.');
      
      // Check if email needs verification
      if (user && !user.isVerified) {
        toast.info('Please verify your email address to access all features.');
      }
      
      // Handle redirect based on user role and source
      const redirectPath = getRedirectPath();
      router.push(redirectPath);
      
      onSuccess?.();
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Show user-friendly error message
      const errorMessage = err?.message || 'Login failed. Please check your credentials and try again.';
      toast.error(errorMessage);
      
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
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
        <p className="text-wrench-text-secondary">Sign in to your account to continue</p>
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
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-wrench-text-primary">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
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
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wrench-text-secondary" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-wrench-text-secondary hover:text-wrench-text-primary"
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
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-wrench-text-secondary">Or</span>
        </div>
      </div>

      {/* Google Login */}
      <GoogleLoginButton
        onSuccess={onSuccess}
        redirectTo={redirectTo}
        text="Continue with Google"
      />

      {/* Footer */}
      <div className="text-center space-y-4">
        <p className="text-sm text-wrench-text-secondary">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-wrench-accent hover:text-wrench-accent-hover font-medium"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
}
