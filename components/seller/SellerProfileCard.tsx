'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Star, MapPin, Calendar, AlertTriangle, CheckCircle, Edit } from 'lucide-react';

interface SellerProfileCardProps {
  seller: {
    id: string;
    shopName: string;
    shopDescription?: string;
    isApproved: boolean;
    ratingAverage: number;
    ratingCount: number;
    createdAt: string;
  };
}

export function SellerProfileCard({ seller }: SellerProfileCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderRating = () => {
    if (seller.ratingCount === 0) {
      return (
        <span className="text-sm text-gray-500">No ratings yet</span>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= seller.ratingAverage
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">
          {seller.ratingAverage.toFixed(1)}
        </span>
        <span className="text-sm text-gray-500">
          ({seller.ratingCount} reviews)
        </span>
      </div>
    );
  };

  const getApprovalStatus = () => {
    if (seller.isApproved) {
      return (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Account Approved</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Pending Approval</span>
        </div>
      );
    }
  };

  return (
    <Card className="border-l-4 border-l-wrench-orange-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Shop Name and Approval Status */}
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {seller.shopName}
                </h2>
                {seller.shopDescription && (
                  <p className="text-gray-600 mb-2">
                    {seller.shopDescription}
                  </p>
                )}
              </div>
              {getApprovalStatus()}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  {renderRating()}
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(seller.createdAt)}
                  </p>
                </div>
              </div>

              {/* Shop ID */}
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Shop ID</p>
                  <p className="text-sm font-medium text-gray-900 font-mono">
                    {seller.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/seller/profile">
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
              {!seller.isApproved && (
                <div className="text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                  ⏳ Your account is under review. You'll be notified once approved.
                </div>
              )}
            </div>
          </div>

          {/* Shop Logo Placeholder */}
          <div className="ml-6">
            <div className="w-20 h-20 bg-gradient-to-br from-wrench-orange-400 to-wrench-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {seller.shopName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}