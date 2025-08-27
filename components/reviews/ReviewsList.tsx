'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { Star, User, MoreVertical, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
  };
}

interface ReviewsListProps {
  serviceId?: string;
  sellerId?: string;
  appointmentId?: string;
  limit?: number;
  showLoadMore?: boolean;
}

export default function ReviewsList({
  serviceId,
  sellerId,
  appointmentId,
  limit = 10,
  showLoadMore = true
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [serviceId, sellerId, appointmentId]);

  const loadReviews = async (pageNum = 1, append = false) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (serviceId) params.append('serviceId', serviceId);
      if (sellerId) params.append('sellerId', sellerId);
      if (appointmentId) params.append('appointmentId', appointmentId);
      params.append('page', pageNum.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/reviews?${params.toString()}`);

      if (response.success && response.data) {
        const newReviews = response.data.reviews || [];
        setReviews(append ? [...reviews, ...newReviews] : newReviews);
        setHasMore(response.data.pagination?.hasMore || false);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    loadReviews(page + 1, true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-600">Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-700">
                  {getInitials(review.reviewer.firstName, review.reviewer.lastName)}
                </span>
              </div>

              {/* Review Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {review.reviewer.firstName} {review.reviewer.lastName}
                    </h4>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                {review.comment && (
                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                    {review.comment}
                  </p>
                )}

                {/* Review Actions */}
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Helpful
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More */}
      {hasMore && showLoadMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More Reviews'}
          </Button>
        </div>
      )}
    </div>
  );
}
