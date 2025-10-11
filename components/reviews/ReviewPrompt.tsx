'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { apiClient } from '@/lib/api/client';
import ReviewForm from './ReviewForm';
import { Star, ThumbsUp, Clock, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReviewPromptProps {
  entityType: 'product' | 'service' | 'seller' | 'appointment' | 'chat';
  entityId: string;
  entityName: string;
  entityImage?: string;
  triggerType: 'chat_completion' | 'appointment_completion' | 'manual';
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export default function ReviewPrompt({
  entityType,
  entityId,
  entityName,
  entityImage,
  triggerType,
  isOpen,
  onClose,
  onReviewSubmitted
}: ReviewPromptProps) {
  const t = useTranslations('common');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  const checkReviewEligibility = async () => {
    setIsCheckingEligibility(true);
    try {
      const response = await apiClient.canUserReview(entityType, entityId);
      setCanReview(response.data?.canReview || false);
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
      setCanReview(false);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const handleReviewLater = () => {
    // Store in localStorage for later reminder
    const reminders = JSON.parse(localStorage.getItem('reviewReminders') || '[]');
    reminders.push({
      entityType,
      entityId,
      entityName,
      entityImage,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('reviewReminders', JSON.stringify(reminders));
    onClose();
  };

  const getTriggerMessage = () => {
    switch (triggerType) {
      case 'chat_completion':
        return {
          title: t('reviews.greatHowWasExperience'),
          subtitle: t('reviews.helpOthersShareThoughts'),
          cta: t('reviews.rateAndReview')
        };
      case 'appointment_completion':
        return {
          title: t('reviews.serviceCompleted'),
          subtitle: t('reviews.shareExperienceHelpOthers'),
          cta: t('reviews.rateService')
        };
      default:
        return {
          title: t('reviews.shareYourExperienceTitle'),
          subtitle: t('reviews.shareYourExperienceSubtitle'),
          cta: t('reviews.writeReview')
        };
    }
  };

  const triggerMessage = getTriggerMessage();

  if (showReviewForm) {
    return (
      <Modal isOpen={isOpen} onClose={() => setShowReviewForm(false)}>
        <ReviewForm
          entityType={entityType}
          entityId={entityId}
          entityName={entityName}
          entityImage={entityImage}
          onReviewSubmitted={() => {
            setShowReviewForm(false);
            onClose();
            onReviewSubmitted?.();
          }}
          onCancel={() => setShowReviewForm(false)}
        />
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
          
          <CardTitle className="text-center">
            {triggerMessage.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Entity Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {entityImage && (
              <img 
                src={entityImage} 
                alt={entityName}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{entityName}</h4>
              <p className="text-sm text-gray-500 capitalize">{entityType}</p>
            </div>
          </div>

          {/* Message */}
          <p className="text-center text-gray-600">
            {triggerMessage.subtitle}
          </p>

          {/* Benefits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              {t('reviews.helpCustomers')}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="h-4 w-4 text-yellow-500" />
              {t('reviews.shareHonestExperience')}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-blue-500" />
              {t('reviews.takesLessThan2Minutes')}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => {
                checkReviewEligibility();
                setShowReviewForm(true);
              }}
              disabled={isCheckingEligibility}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Star className="h-4 w-4 mr-2" />
              {isCheckingEligibility ? t('reviews.checking') : triggerMessage.cta}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleReviewLater}
                className="text-sm"
              >
                <Clock className="h-3 w-3 mr-1" />
                {t('reviews.later')}
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-sm text-gray-500"
              >
                {t('reviews.notNow')}
              </Button>
            </div>
          </div>

          {canReview === false && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {t('reviews.moreInteractionNeeded', { entityType })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Modal>
  );
}
