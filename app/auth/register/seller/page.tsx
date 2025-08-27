'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Eye, EyeOff, User, Mail, Lock, Phone, CheckCircle, ArrowLeft, Store, 
  MapPin, Building, FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  sellerRegisterSchema, 
  type SellerRegisterFormData, 
  businessTypeOptions 
} from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

export default function SellerRegisterPage() {
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
      businessType: '',
      description: '',
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

  const onSubmit = async (data: SellerRegisterFormData) => {
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
        shopName: data.shopName,
        shopAddress: data.shopAddress,
        businessType: data.businessType,
        description: data.description || undefined,
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-3 bg-[#D4F142] bg-opacity-20 rounded-xl">
              <Store className="h-6 w-6 text-[#9CB833]" />
            </div>
          </div>
          <h1 className="text-heading-1 text-black mb-2">
            Create Seller Account
          </h1>
          <p className="text-body text-gray-600">
            Join WrenchEX to sell auto parts and offer professional services
          </p>
        </div>

        {/* Registration Form */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle className="text-center">Seller Registration</CardTitle>
            <CardDescription className="text-center">
              Fill in your personal and business details
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

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                  Personal Information
                </h3>

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
                  hint="Customers will use this to contact you"
                />
              </div>

              {/* Business Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                  Business Information
                </h3>

                {/* Shop Name */}
                <Input
                  {...register('shopName')}
                  type="text"
                  label="Shop/Business Name"
                  placeholder="Auto Parts Express"
                  leftIcon={<Store className="h-4 w-4" />}
                  error={errors.shopName?.message}
                  disabled={isLoading || isSubmitting}
                />

                {/* Shop Address */}
                <Input
                  {...register('shopAddress')}
                  type="text"
                  label="Business Address"
                  placeholder="123 Main St, City, State, ZIP"
                  leftIcon={<MapPin className="h-4 w-4" />}
                  error={errors.shopAddress?.message}
                  disabled={isLoading || isSubmitting}
                  hint="Include full address with city, state, and ZIP code"
                />

                {/* Business Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">
                    Business Type
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      {...register('businessType')}
                      className={cn(
                        'input-base pl-10',
                        errors.businessType && 'border-red-300 focus:border-red-500'
                      )}
                      disabled={isLoading || isSubmitting}
                    >
                      <option value="">Select business type</option>
                      {businessTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.businessType && (
                    <p className="text-xs text-red-600">{errors.businessType.message}</p>
                  )}
                </div>

                {/* Business Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">
                    Business Description (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      {...register('description')}
                      placeholder="Describe your business, services, and specialties..."
                      rows={4}
                      className={cn(
                        'input-base pl-10',
                        errors.description && 'border-red-300 focus:border-red-500'
                      )}
                      disabled={isLoading || isSubmitting}
                    />
                  </div>
                  {errors.description && (
                    <p className="text-xs text-red-600">{errors.description.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Help customers understand what you offer (max 1000 characters)
                  </p>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black border-b border-gray-200 pb-2">
                  Account Security
                </h3>

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
                Create Seller Account
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <div className="w-full text-center space-y-4">
              {/* Additional Info */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800 font-medium mb-1">
                  📋 Account Review Process
                </p>
                <p className="text-xs text-blue-700">
                  Your seller account will be reviewed by our team within 24-48 hours. 
                  You'll receive an email once approved.
                </p>
              </div>

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