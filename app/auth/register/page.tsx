'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Store, ShoppingCart, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { roleSelectionSchema, type RoleSelectionFormData } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

const roleOptions = [
  {
    value: 'BUYER' as const,
    title: 'I want to buy auto parts & services',
    description: 'Browse products, book services, and connect with local sellers',
    icon: ShoppingCart,
    features: [
      'Browse auto parts catalog',
      'Book mechanic services',
      'Compare prices & reviews',
      'Track orders & appointments',
      'Direct communication with sellers',
    ],
    buttonText: 'Register as Buyer',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    value: 'SELLER' as const,
    title: 'I want to sell auto parts & services',
    description: 'List your products, offer services, and grow your automotive business',
    icon: Store,
    features: [
      'List unlimited products',
      'Offer professional services',
      'Manage appointments',
      'Track sales & analytics',
      'Build customer relationships',
    ],
    buttonText: 'Register as Seller',
    color: 'bg-[#D4F142] bg-opacity-20 border-[#D4F142] hover:bg-[#D4F142] hover:bg-opacity-30',
    iconColor: 'text-[#9CB833]',
  },
];

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RoleSelectionFormData>({
    resolver: zodResolver(roleSelectionSchema),
  });

  const selectedRole = watch('role');

  const onSubmit = (data: RoleSelectionFormData) => {
    // Redirect to role-specific registration form
    router.push(`/auth/register/${data.role.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-wrench-bg-primary py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-heading-1 text-black mb-4">
            Join WrenchEX Community
          </h1>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
            Choose your role to get started with the best automotive marketplace experience
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.value;

              return (
                <label key={option.value} className="cursor-pointer group">
                  <input
                    {...register('role')}
                    type="radio"
                    value={option.value}
                    className="sr-only"
                  />
                  
                  <Card
                    variant="interactive"
                    padding="lg"
                    className={cn(
                      'h-full transition-all duration-300 border-2',
                      isSelected 
                        ? 'border-[#D4F142] bg-[#D4F142] bg-opacity-10 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300',
                      'group-hover:scale-105'
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={cn(
                          'p-3 rounded-xl',
                          isSelected 
                            ? 'bg-[#D4F142] text-black' 
                            : 'bg-gray-100 text-gray-600'
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-6 w-6 text-[#D4F142]" />
                        )}
                      </div>
                      <CardTitle className="text-xl">
                        {option.title}
                      </CardTitle>
                      <CardDescription>
                        {option.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-3">
                        {option.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </label>
              );
            })}
          </div>

          {/* Error Message */}
          {errors.role && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 text-center">
                {errors.role.message}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <div className="text-center mb-8">
            <Button
              type="submit"
              variant="primary"
              size="xl"
              className="min-w-[200px]"
              disabled={!selectedRole || isSubmitting}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Continue Registration
            </Button>
          </div>

          {/* Additional Info */}
          <Card variant="flat" padding="md" className="max-w-2xl mx-auto">
            <CardContent>
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-black">
                  Why Choose WrenchEX?
                </h3>
                <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="space-y-2">
                    <div className="h-12 w-12 bg-[#D4F142] bg-opacity-20 rounded-lg flex items-center justify-center mx-auto">
                      <CheckCircle className="h-6 w-6 text-[#9CB833]" />
                    </div>
                    <p className="font-medium">Verified Sellers</p>
                    <p>All sellers are verified for quality and reliability</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 w-12 bg-[#D4F142] bg-opacity-20 rounded-lg flex items-center justify-center mx-auto">
                      <CheckCircle className="h-6 w-6 text-[#9CB833]" />
                    </div>
                    <p className="font-medium">Secure Payments</p>
                    <p>Safe and secure payment processing</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-12 w-12 bg-[#D4F142] bg-opacity-20 rounded-lg flex items-center justify-center mx-auto">
                      <CheckCircle className="h-6 w-6 text-[#9CB833]" />
                    </div>
                    <p className="font-medium">Local Support</p>
                    <p>Connect with local automotive professionals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
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

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 