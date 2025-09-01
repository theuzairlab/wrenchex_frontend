import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { UserX, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop Not Found</h1>
          <p className="text-gray-600">
            The shop you're looking for doesn't exist or may have been removed.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/" className="w-full">
            <Button className="w-full" leftIcon={<Home className="h-4 w-4" />}>
              Go Home
            </Button>
          </Link>
          
          <Link href="/search" className="w-full">
            <Button variant="outline" className="w-full" leftIcon={<Search className="h-4 w-4" />}>
              Search Shops
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
