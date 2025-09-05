import Link from 'next/link';
import { Metadata } from 'next';
import { ShoppingCart, ArrowLeft, Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Product Not Found | WrenchEX',
  description: 'The product you are looking for could not be found.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-wrench-bg-primary flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center mt-20">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-16 w-16 text-gray-400" />
          </div>
          <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Product Not Found
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Sorry, the product you're looking for doesn't exist or may have been removed. 
            It might have been sold out, discontinued, or the link might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products">
              <Button variant="primary" className="w-full sm:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Browse All Products
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          <Link href="/" className="block">
            <Button variant="ghost" className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Return to Homepage
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help finding a specific part?{' '}
            <Link href="/contact" className="text-wrench-accent hover:text-wrench-accent-hover font-medium">
              Contact our support team
            </Link>{' '}
            or use our advanced search to find what you need.
          </p>
        </div>
      </div>
    </div>
  );
}