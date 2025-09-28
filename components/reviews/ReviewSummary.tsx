'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api/client';
import { ReviewSummary as ReviewSummaryType } from '@/types';
import { Star, Filter } from 'lucide-react';

interface ReviewSummaryProps {
  entityType: 'product' | 'service' | 'seller';
  entityId: string;
  onRatingFilter?: (rating: number | null) => void;
  selectedRating?: number | null;
}

export default function ReviewSummary({
  entityType,
  entityId,
  onRatingFilter,
  selectedRating
}: ReviewSummaryProps) {
  const [summary, setSummary] = useState<ReviewSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [entityType, entityId]);

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getReviewSummary(entityType, entityId);
      
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to load review summary:', error);
      setSummary({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4', 
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getPercentage = (rating: number): number => {
    if (!summary || summary.totalReviews === 0) return 0;
    return Math.round((summary.ratingBreakdown[rating] || 0) / summary.totalReviews * 100);
  };

  const getRatingText = (rating: number): string => {
    const texts = {
      5: 'Excellent',
      4: 'Good',
      3: 'Average',
      2: 'Poor',
      1: 'Very Poor'
    };
    return texts[rating as keyof typeof texts] || '';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || summary.totalReviews === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl text-gray-300 mb-2">0</div>
            <div className="flex justify-center mb-2">
              {renderStars(0, 'lg')}
            </div>
            <p className="text-gray-600 mb-4">No reviews yet</p>
            <p className="text-sm text-gray-500">Be the first to share your experience!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Customer Reviews
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {summary.averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">
            {renderStars(Math.round(summary.averageRating), 'lg')}
          </div>
          <p className="text-gray-600">
            Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Rating Breakdown</h4>
            {onRatingFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRatingFilter(null)}
                className={`text-xs ${!selectedRating ? 'bg-gray-100' : ''}`}
              >
                <Filter className="h-3 w-3 mr-1" />
                All
              </Button>
            )}
          </div>
          
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = summary.ratingBreakdown[rating] || 0;
            const percentage = getPercentage(rating);
            const isSelected = selectedRating === rating;
            
            return (
              <div
                key={rating}
                className={`flex items-center gap-3 ${
                  onRatingFilter ? 'cursor-pointer hover:bg-gray-50 rounded p-2' : ''
                } ${isSelected ? 'bg-blue-50 border border-blue-200 rounded' : ''}`}
                onClick={() => onRatingFilter?.(isSelected ? null : rating)}
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                </div>
                
                <div className="flex-1">
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                </div>
                
                <div className="text-sm text-gray-600 min-w-0">
                  <span className="font-medium">{count}</span>
                  <span className="text-gray-500 ml-1">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rating Labels */}
        <div className="grid grid-cols-5 gap-1 text-xs text-center text-gray-500">
          {[1, 2, 3, 4, 5].map((rating) => (
            <div key={rating} className="truncate">
              {getRatingText(rating)}
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {Math.round((summary.ratingBreakdown[5] || 0) / summary.totalReviews * 100)}%
              </div>
              <div className="text-xs text-gray-500">Excellent Reviews</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(((summary.ratingBreakdown[4] || 0) + (summary.ratingBreakdown[5] || 0)) / summary.totalReviews * 100)}%
              </div>
              <div className="text-xs text-gray-500">Positive Reviews</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
