'use client';

import { useState, useEffect } from 'react';

interface ReviewReminder {
  entityType: 'product' | 'service' | 'seller' | 'appointment' | 'chat';
  entityId: string;
  entityName: string;
  entityImage?: string;
  createdAt: string;
}

interface ReviewPromptState {
  entityType: 'product' | 'service' | 'seller' | 'appointment' | 'chat';
  entityId: string;
  entityName: string;
  entityImage?: string;
  triggerType: 'chat_completion' | 'appointment_completion' | 'manual';
}

export function useReviewPrompts() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<ReviewPromptState | null>(null);
  const [reminders, setReminders] = useState<ReviewReminder[]>([]);

  // Load reminders from localStorage
  useEffect(() => {
    const savedReminders = localStorage.getItem('reviewReminders');
    if (savedReminders) {
      try {
        const parsed = JSON.parse(savedReminders);
        // Filter out old reminders (older than 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const validReminders = parsed.filter((reminder: ReviewReminder) => 
          new Date(reminder.createdAt) > thirtyDaysAgo
        );
        
        setReminders(validReminders);
        
        // Update localStorage with cleaned reminders
        if (validReminders.length !== parsed.length) {
          localStorage.setItem('reviewReminders', JSON.stringify(validReminders));
        }
      } catch (error) {
        console.error('Error loading review reminders:', error);
        localStorage.removeItem('reviewReminders');
      }
    }
  }, []);

  // Trigger review prompt
  const triggerReviewPrompt = (prompt: ReviewPromptState) => {
    setCurrentPrompt(prompt);
    setShowPrompt(true);
  };

  // Close review prompt
  const closeReviewPrompt = () => {
    setShowPrompt(false);
    setCurrentPrompt(null);
  };

  // Remove a reminder
  const removeReminder = (entityId: string) => {
    const updatedReminders = reminders.filter(r => r.entityId !== entityId);
    setReminders(updatedReminders);
    localStorage.setItem('reviewReminders', JSON.stringify(updatedReminders));
  };

  // Clear all reminders
  const clearAllReminders = () => {
    setReminders([]);
    localStorage.removeItem('reviewReminders');
  };

  // Prompt for chat completion
  const promptForChatReview = (productId: string, productName: string, productImage?: string) => {
    triggerReviewPrompt({
      entityType: 'product',
      entityId: productId,
      entityName: productName,
      entityImage: productImage,
      triggerType: 'chat_completion'
    });
  };

  // Prompt for appointment completion
  const promptForAppointmentReview = (appointmentId: string, serviceName: string, serviceImage?: string) => {
    triggerReviewPrompt({
      entityType: 'appointment',
      entityId: appointmentId,
      entityName: serviceName,
      entityImage: serviceImage,
      triggerType: 'appointment_completion'
    });
  };

  // Prompt for service review
  const promptForServiceReview = (serviceId: string, serviceName: string, serviceImage?: string) => {
    triggerReviewPrompt({
      entityType: 'service',
      entityId: serviceId,
      entityName: serviceName,
      entityImage: serviceImage,
      triggerType: 'manual'
    });
  };

  // Prompt for seller review
  const promptForSellerReview = (sellerId: string, shopName: string, shopImage?: string) => {
    triggerReviewPrompt({
      entityType: 'seller',
      entityId: sellerId,
      entityName: shopName,
      entityImage: shopImage,
      triggerType: 'manual'
    });
  };

  // Check if we should show reminders (e.g., on dashboard)
  const shouldShowReminders = reminders.length > 0;

  return {
    // State
    showPrompt,
    currentPrompt,
    reminders,
    shouldShowReminders,
    
    // Actions
    triggerReviewPrompt,
    closeReviewPrompt,
    removeReminder,
    clearAllReminders,
    
    // Convenience methods
    promptForChatReview,
    promptForAppointmentReview,
    promptForServiceReview,
    promptForSellerReview
  };
}
