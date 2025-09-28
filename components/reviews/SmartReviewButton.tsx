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

  const getEligibilityMessage = (entityType: string): string => {
    const messages = {
      product: {
        title: '💬 Start a conversation first!',
        message: 'To review this product, you need to chat with the seller first. Start a conversation by asking questions about the product, and after exchanging 5+ messages, you\'ll be able to leave a review.',
        action: 'Start chatting with the seller to unlock review access'
      },
      service: {
        title: '📅 Book and complete the service first!',
        message: 'To review this service, you need to book an appointment and complete the service. After your appointment is marked as completed, you\'ll have 60 days to leave a review.',
        action: 'Book this service to unlock review access'
      },
      seller: {
        title: '🛍️ Interact with the shop first!',
        message: 'To review this shop, you need to have some interaction first. You can either chat about products or book a service. After any meaningful interaction, you\'ll be able to rate the overall shop experience.',
        action: 'Chat about products or book services to unlock review access'
      },
      appointment: {
        title: '✅ Complete your appointment first!',
        message: 'You can only review appointments that have been completed. Once your appointment is finished, you\'ll be able to rate the service experience.',
        action: 'Complete your appointment to unlock review access'
      },
      chat: {
        title: '💬 Have more conversation first!',
        message: 'To review the chat experience, you need to have exchanged at least 5 messages with the seller. Continue your conversation to unlock review access.',
        action: 'Exchange more messages to unlock review access'
      }
    };

    return messages[entityType as keyof typeof messages]?.message || 'You need to interact with this item first before leaving a review.';
  };

  const handleReviewClick = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      openAuthModal('login');
      toast.error('Please log in to write a review');
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
    if (isCheckingEligibility) return 'Checking...';
    if (!isAuthenticated) return 'Login to Review';
    return 'Write a Review';
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
        'Click "Chat with Seller" button',
        'Ask questions about the product',
        'Exchange at least 5 messages',
        'Review button will be unlocked'
      ],
      service: [
        'Click "Book This Service" button',
        'Schedule your appointment',
        'Complete the service',
        'Review within 60 days'
      ],
      seller: [
        'Chat about any product, OR',
        'Book any service from this shop',
        'Complete the interaction',
        'Review the overall shop experience'
      ],
      appointment: [
        'Wait for your appointment',
        'Complete the service',
        'Review button will appear',
        'Share your experience'
      ],
      chat: [
        'Continue your conversation',
        'Exchange at least 5 messages',
        'Ask questions or discuss details',
        'Review the communication experience'
      ]
    };
    return steps[type as keyof typeof steps] || ['Interact with this item first', 'Complete the required actions', 'Return to leave a review'];
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
                  Review Not Available Yet
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
                <h4 className="font-medium text-gray-900">How to unlock reviews:</h4>
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
                Got it!
              </Button>
            </CardContent>
          </Card>
        </Modal>
      )}
    </>
  );
}
