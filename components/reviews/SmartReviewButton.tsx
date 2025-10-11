'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth';
import { useAuthModal } from '@/components/auth';
import ReviewForm from './ReviewForm';
import { Star, MessageCircle, Calendar, ShoppingBag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface SmartReviewButtonProps {
  entityType: 'product' | 'service' | 'seller' | 'appointment' | 'chat';
  entityId: string;
  entityName: string;
  entityImage?: string;
  onReviewSubmitted?: () => void;
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function SmartReviewButton({
  entityType,
  entityId,
  entityName,
  entityImage,
  onReviewSubmitted,
  className = '',
  variant = 'primary',
  size = 'md'
}: SmartReviewButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthModal();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState('');
  const t = useTranslations('common.smartReview');

  const getEligibilityMessage = (entityType: string): string => {
    const messages = {
      product: t('productReviewMessage'),
      service: t('serviceReviewMessage'),
      seller: t('shopReviewMessage'),
      appointment: t('appointmentReviewMessage'),
      chat: t('chatReviewMessage')
    };

    return messages[entityType as keyof typeof messages] || t('defaultMessage');
  };

  const handleReviewClick = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      openAuthModal('login');
      toast.error(t('pleaseLoginToReview'));
      return;
    }

    // Check eligibility
    setIsCheckingEligibility(true);
    try {
      const response = await apiClient.canUserReview(entityType, entityId);
      
      if (response.success && response.data?.canReview) {
        // User is eligible, show review form
        setShowReviewForm(true);
      } else {
        // User is not eligible, show explanation
        const message = getEligibilityMessage(entityType);
        setEligibilityMessage(message);
        setShowEligibilityModal(true);
      }
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
      // Assume not eligible and show message
      const message = getEligibilityMessage(entityType);
      setEligibilityMessage(message);
      setShowEligibilityModal(true);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const getButtonText = () => {
    if (isCheckingEligibility) return t('checking');
    if (!isAuthenticated) return t('loginToReview');
    return t('writeReview');
  };

  const getButtonIcon = () => {
    if (isCheckingEligibility) return null;
    if (!isAuthenticated) return <Star className="h-4 w-4 mr-2" />;
    return <Star className="h-4 w-4 mr-2" />;
  };

  const getRequirementIcon = (type: string) => {
    const icons = {
      product: <MessageCircle className="h-6 w-6 text-blue-500" />,
      service: <Calendar className="h-6 w-6 text-green-500" />,
      seller: <ShoppingBag className="h-6 w-6 text-purple-500" />,
      appointment: <Calendar className="h-6 w-6 text-orange-500" />,
      chat: <MessageCircle className="h-6 w-6 text-blue-500" />
    };
    return icons[type as keyof typeof icons] || <AlertCircle className="h-6 w-6 text-gray-500" />;
  };

  const getActionSteps = (type: string) => {
    const steps = {
      product: [
        t('productReviewAction'),
        t('productReviewMessage'),
        t('productReviewAction'),
        t('productReviewAction')
      ],
      service: [
        t('serviceReviewAction'),
        t('serviceReviewAction'),
        t('serviceReviewAction'),
        t('serviceReviewAction')
      ],
      seller: [
        t('shopReviewAction'),
        t('shopReviewAction'),
        t('shopReviewAction'),
        t('shopReviewAction')
      ],
      appointment: [
        t('appointmentReviewAction'),
        t('appointmentReviewAction'),
        t('appointmentReviewAction'),
        t('appointmentReviewAction')
      ],
      chat: [
        t('chatReviewAction'),
        t('chatReviewAction'),
        t('chatReviewAction'),
        t('chatReviewAction')
      ]
    };
    return steps[type as keyof typeof steps] || [t('defaultMessage'), t('defaultMessage'), t('defaultMessage')];
  };

  return (
    <>
      {/* Review Button */}
      <Button
        onClick={handleReviewClick}
        disabled={isCheckingEligibility}
        className={className}
        variant={variant}
        size={size}
      >
        {getButtonIcon()}
        {getButtonText()}
      </Button>

      {/* Review Form Modal */}
      {showReviewForm && (
        <Modal isOpen={showReviewForm} onClose={() => setShowReviewForm(false)}>
          <ReviewForm
            entityType={entityType}
            entityId={entityId}
            entityName={entityName}
            entityImage={entityImage}
            onReviewSubmitted={() => {
              setShowReviewForm(false);
              onReviewSubmitted?.();
            }}
            onCancel={() => setShowReviewForm(false)}
          />
        </Modal>
      )}

      {/* Eligibility Explanation Modal */}
      {showEligibilityModal && (
        <Modal isOpen={showEligibilityModal} onClose={() => setShowEligibilityModal(false)}>
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                {getRequirementIcon(entityType)}
                <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2">
                  {t('writeReview')}
                </h3>
                <p className="text-sm text-gray-600">
                  {eligibilityMessage}
                </p>
              </div>

              {/* Entity Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
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

              {/* Action Steps */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium text-gray-900">{t('writeReview')}</h4>
                <ol className="space-y-2">
                  {getActionSteps(entityType).map((step, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setShowEligibilityModal(false)}
                className="w-full"
                variant="outline"
              >
{t('writeReview')}
              </Button>
            </CardContent>
          </Card>
        </Modal>
      )}
    </>
  );
}
