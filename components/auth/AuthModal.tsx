'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  disableBackdropClick?: boolean;
}

export function AuthModal({ isOpen, onClose, children, title, className, disableBackdropClick = false }: AuthModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={disableBackdropClick ? undefined : onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        "relative w-full bg-white rounded-2xl shadow-2xl transform transition-all duration-300 my-4 sm:my-8",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4",
        className
      )}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-6 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-wrench-text-primary">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
