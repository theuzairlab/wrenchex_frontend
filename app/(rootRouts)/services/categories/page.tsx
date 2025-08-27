'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import ServiceCategories from '@/components/services/ServiceCategories';
import { ArrowLeft, Search } from 'lucide-react';

export default function ServiceCategoriesPage() {
  const router = useRouter();

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId) {
      router.push(`/services?category=${categoryId}`);
    } else {
      router.push('/services');
    }
  };

  return (
    <div className="min-h-screen bg-wrench-bg-primary">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-responsive py-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="mb-4"
          >
            Back
          </Button>
          
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Service Categories
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Browse automotive services by category to find exactly what you need
            </p>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => router.push('/services')}
                leftIcon={<Search className="h-4 w-4" />}
              >
                Browse All Services
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container-responsive py-8">
        <ServiceCategories 
          onCategoryChange={handleCategorySelect}
          showHeader={false}
        />
      </div>
    </div>
  );
}
