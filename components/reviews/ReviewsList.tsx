'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api/client';
import { Review } from '@/types';
import { toast } from 'sonner';
import { Star, MoreVertical, ThumbsUp, Camera, Verified } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

interface ReviewsListProps {
  entityType?: 'product' | 'service' | 'seller' | 'appointment' | 'chat';
  entityId?: string;
  limit?: number;
  showLoadMore?: boolean;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
  ratingFilter?: number;
}

export default function ReviewsList({
  entityType,
  entityId,
  limit = 10,
  showLoadMore = true,
  sortBy = 'newest',
  ratingFilter
}: ReviewsListProps) {
  const t = useTranslations('common');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    loadReviews();
  }, [entityType, entityId, sortBy, ratingFilter]);

  const loadReviews = async (pageNum = 1, append = false) => {
    try {
      setIsLoading(true);

      const filters: any = {
        page: pageNum,
        limit,
        sortBy
      };

      if (entityType && entityId) {
        filters.entityType = entityType;
        filters.entityId = entityId;
      }

      if (ratingFilter) {
        filters.rating = ratingFilter;
      }

      const response = await apiClient.getReviews(filters);

      if (response.success && response.data) {
        const newReviews = response.data.reviews || [];
        setReviews(append ? [...reviews, ...newReviews] : newReviews);
        setHasMore(response.data.pagination?.hasMore || false);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error(t('reviews.failedToLoadReviews', { default: 'Failed to load reviews' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    try {
      const response = await apiClient.markReviewHelpful(reviewId);
      
      if (response.success) {
        setHelpfulVotes(prev => ({
          ...prev,
          [reviewId]: response.data.helpful
        }));
        
        // Update the helpful count in the reviews list
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                helpfulCount: response.data.helpful 
                  ? review.helpfulCount + 1 
                  : review.helpfulCount - 1 
              }
            : review
        ));
        
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
      toast.error(t('reviews.failedToMarkHelpful', { default: 'Failed to mark review as helpful' }));
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

  const getEntityInfo = (review: Review) => {
    if (review.product) {
      return { type: 'Product', name: review.product.title };
    } else if (review.service) {
      return { type: 'Service', name: review.service.title };
    } else if (review.seller) {
      return { type: 'Shop', name: review.seller.shopName };
    } else if (review.appointmentId) {
      return { type: 'Appointment', name: 'Service Experience' };
    } else if (review.chatId) {
      return { type: 'Chat', name: 'Communication Experience' };
    }
    return { type: 'Review', name: 'Experience' };
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('reviews.noReviewsYet')}</h3>
        <p className="text-gray-600">{t('reviews.beFirstToReview')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const entityInfo = getEntityInfo(review);
        const isHelpful = helpfulVotes[review.id];
        
        return (
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
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </h4>
                        {review.isVerified && (
                          <div title={t('reviews.verifiedPurchase', { default: 'Verified Purchase' })}>
                            <Verified className="h-4 w-4 text-blue-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {format(new Date(review.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>

                      {/* Entity Badge (only show if not filtering by specific entity) */}
                      {!entityType && (
                        <Badge variant="outline" className="text-xs">
                          {t(`reviews.entity.${entityInfo.type.toLowerCase()}`, { default: entityInfo.type })}: {entityInfo.name}
                        </Badge>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h5 className="font-medium text-gray-900 mb-2">
                      {review.title}
                    </h5>
                  )}

                  {/* Review Comment */}
                  {review.comment && (
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            // TODO: Implement image lightbox
                            window.open(image, '_blank');
                          }}
                        />
                      ))}
                      {review.images.length > 0 && (
                        <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-lg border flex-shrink-0">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`text-gray-500 hover:text-gray-700 ${isHelpful ? 'text-blue-600' : ''}`}
                      onClick={() => handleHelpfulVote(review.id)}
                    >
                      <ThumbsUp className={`h-3 w-3 mr-1 ${isHelpful ? 'fill-current' : ''}`} />
                      {t('reviews.helpful')} {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Load More */}
      {hasMore && showLoadMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? t('nav.loading') : t('reviews.loadMoreReviews')}
          </Button>
        </div>
      )}
    </div>
  );
}
