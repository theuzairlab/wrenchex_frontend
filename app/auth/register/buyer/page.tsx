'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock, Phone, CheckCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/auth';
import { buyerRegisterSchema, type BuyerRegisterFormData } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

export default function BuyerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const { register: registerUser, isLoading, error, clearError, isAuthenticated } = useAuthStore();

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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const password = watch('password');

  const onSubmit = async (data: BuyerRegisterFormData) => {
    try {
      clearErrors();
      clearError();

      // Prepare registration data
      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        role: data.role,
      };

      await registerUser(registrationData);

      // Redirect will be handled by the useEffect above
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle specific error cases
      if (error.message?.includes('already exists') || 
          error.message?.includes('already registered')) {
        setError('email', { 
          type: 'manual', 
          message: 'An account with this email already exists' 
        });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-wrench-bg-primary py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 bg-[#D4F142] bg-opacity-20 rounded-xl">
              <ShoppingCart className="h-6 w-6 text-[#9CB833]" />
            </div>
          </div>
          <h1 className="text-heading-1 text-black mb-2">
            Create Buyer Account
          </h1>
          <p className="text-body text-gray-600">
            Join WrenchEX to find the best auto parts and services
          </p>
        </div>

        {/* Registration Form */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-center">Buyer Registration</CardTitle>
            <CardDescription className="text-center">
              Fill in your details to create your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Global Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register('firstName')}
                  type="text"
                  label="First Name"
                  placeholder="John"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.firstName?.message}
                  disabled={isLoading || isSubmitting}
                />
                <Input
                  {...register('lastName')}
                  type="text"
                  label="Last Name"
                  placeholder="Doe"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.lastName?.message}
                  disabled={isLoading || isSubmitting}
                />
              </div>

              {/* Email Field */}
              <Input
                {...register('email')}
                type="email"
                label="Email Address"
                placeholder="john.doe@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                disabled={isLoading || isSubmitting}
              />

              {/* Phone Field */}
              <Input
                {...register('phone')}
                type="tel"
                label="Phone Number (Optional)"
                placeholder="+1 (555) 123-4567"
                leftIcon={<Phone className="h-4 w-4" />}
                error={errors.phone?.message}
                disabled={isLoading || isSubmitting}
                hint="We'll use this to contact you about your orders"
              />

              {/* Password Field */}
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a strong password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                disabled={isLoading || isSubmitting}
              />

              {/* Confirm Password Field */}
              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Confirm your password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                error={errors.confirmPassword?.message}
                disabled={isLoading || isSubmitting}
              />

              {/* Password Requirements */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className={cn(
                    'flex items-center space-x-2',
                    password?.length >= 8 ? 'text-green-600' : 'text-gray-600'
                  )}>
                    <CheckCircle className={cn(
                      'h-3 w-3',
                      password?.length >= 8 ? 'text-green-600' : 'text-gray-400'
                    )} />
                    <span>At least 8 characters</span>
                  </li>
                  <li className={cn(
                    'flex items-center space-x-2',
                    /[A-Z]/.test(password || '') ? 'text-green-600' : 'text-gray-600'
                  )}>
                    <CheckCircle className={cn(
                      'h-3 w-3',
                      /[A-Z]/.test(password || '') ? 'text-green-600' : 'text-gray-400'
                    )} />
                    <span>One uppercase letter</span>
                  </li>
                  <li className={cn(
                    'flex items-center space-x-2',
                    /[a-z]/.test(password || '') ? 'text-green-600' : 'text-gray-600'
                  )}>
                    <CheckCircle className={cn(
                      'h-3 w-3',
                      /[a-z]/.test(password || '') ? 'text-green-600' : 'text-gray-400'
                    )} />
                    <span>One lowercase letter</span>
                  </li>
                  <li className={cn(
                    'flex items-center space-x-2',
                    /\d/.test(password || '') ? 'text-green-600' : 'text-gray-600'
                  )}>
                    <CheckCircle className={cn(
                      'h-3 w-3',
                      /\d/.test(password || '') ? 'text-green-600' : 'text-gray-400'
                    )} />
                    <span>One number</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isLoading || isSubmitting}
                disabled={isLoading || isSubmitting}
              >
                Create Buyer Account
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <div className="w-full text-center space-y-4">
              {/* Terms */}
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <Link href="/legal/terms" className="text-[#D4F142] hover:text-[#C9E635]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/legal/privacy" className="text-[#D4F142] hover:text-[#C9E635]">
                  Privacy Policy
                </Link>
              </p>

              {/* Back to Role Selection */}
              <Link href="/auth/register">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Change Role
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-[#D4F142] hover:text-[#C9E635] font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 