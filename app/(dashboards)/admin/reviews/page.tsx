'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  Star, 
  MessageSquare, 
  Clock, 
  User, 
  Package,
  Construction
} from 'lucide-react';

export default function AdminReviewsPage() {
  const { isLoading, isAuthenticated } = useAuthStore();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600">Monitor and manage platform reviews and ratings</p>
        </div>
      </div>

      {/* Coming Soon Message */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-8">
          <div className="text-center">
            <Construction className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">Coming Soon!</h2>
            <p className="text-yellow-700 mb-6 max-w-md mx-auto">
              The review management system is currently under development. This feature will allow admins to:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-gray-700">Monitor all platform reviews</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">Moderate inappropriate content</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <User className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Track review analytics</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-700">Manage review policies</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-yellow-600">
                <strong>Expected Features:</strong>
              </p>
              <ul className="text-sm text-yellow-600 space-y-1">
                <li>• View all product and service reviews</li>
                <li>• Filter reviews by rating, date, and content</li>
                <li>• Flag and remove inappropriate reviews</li>
                <li>• Review analytics and reporting</li>
                <li>• Automated review moderation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
              <Star className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Moderation</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged Reviews</p>
                <p className="text-2xl font-bold text-gray-900">--</p>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
              <MessageSquare className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Review management system coming soon</p>
            <p className="text-sm text-gray-400">
              This section will display recent reviews, moderation queue, and review analytics
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
