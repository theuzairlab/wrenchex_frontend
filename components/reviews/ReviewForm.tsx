'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FileUpload } from '@/components/ui/FileUpload';
import { apiClient } from '@/lib/api/client';
import { CreateReviewData } from '@/types';
import { toast } from 'sonner';
import { Star, Send, Camera, X } from 'lucide-react';

interface ReviewFormProps {
  entityType: 'product' | 'service' | 'seller' | 'appointment' | 'chat';
  entityId: string;
  entityName: string;
  entityImage?: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  entityType,
  entityId,
  entityName,
  entityImage,
  onReviewSubmitted,
  onCancel
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return [];
    
    setIsUploadingImages(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiClient.getToken()}`
          },
          body: formData
        });
        
        const result = await response.json();
        return result.data?.url || '';
      });
      
      const urls = await Promise.all(uploadPromises);
      return urls.filter(url => url); // Filter out empty URLs
    } catch (error) {
      console.error('Failed to upload images:', error);
      toast.error('Failed to upload images');
      return [];
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload images first if any
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await handleImageUpload(images);
      }
      
      const reviewData: CreateReviewData = {
        entityType,
        entityId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined
      };

      const response = await apiClient.createReview(reviewData);

      if (response.success) {
        toast.success('Review submitted successfully!');
        onReviewSubmitted?.();
      } else {
        toast.error(response.error?.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number): string => {
    const texts = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    };
    return texts[rating as keyof typeof texts] || '';
  };

  const getEntityTypeText = (type: string): string => {
    const texts = {
      product: 'product',
      service: 'service',
      seller: 'shop',
      appointment: 'appointment',
      chat: 'experience'
    };
    return texts[type as keyof typeof texts] || 'item';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Star className="h-5 w-5 text-yellow-500" />
          Rate Your {getEntityTypeText(entityType)}
        </CardTitle>
        <div className="flex items-center gap-3 mt-2">
          {entityImage && (
            <img 
              src={entityImage} 
              alt={entityName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <p className="font-medium text-gray-900">{entityName}</p>
            <p className="text-sm text-gray-500 capitalize">{entityType}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Star Rating */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 mb-3">
            How was your experience?
          </p>
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 font-medium">
              {getRatingText(rating)}
            </p>
          )}
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title (Optional)
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience..."
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about your experience..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos (Optional)
          </label>
          <div className="space-y-3">
            <FileUpload
              multiple
              accept="image/*"
              maxFiles={5}
              maxSize={5 * 1024 * 1024} // 5MB
              onUpload={setImages}
              // disabled={isUploadingImages}
            />
            <p className="text-xs text-gray-500">
              Upload up to 5 photos (max 5MB each)
            </p>
            
            {/* Image Preview */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => {
                        const newImages = images.filter((_, i) => i !== index);
                        setImages(newImages);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isUploadingImages}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting || isUploadingImages}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting Review...' : 
               isUploadingImages ? 'Uploading Images...' : 
               'Submit Review'}
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
