'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg', 
  xl: 'max-w-2xl',
  full: 'max-w-[95vw] max-h-[95vh]',
};

const MODAL_VARIANTS = {
  default: {
    icon: null,
    colors: 'border-gray-200',
    iconColor: '',
  },
  success: {
    icon: CheckCircle,
    colors: 'border-green-200',
    iconColor: 'text-green-600',
  },
  warning: {
    icon: AlertTriangle,
    colors: 'border-yellow-200',
    iconColor: 'text-yellow-600',
  },
  error: {
    icon: AlertCircle,
    colors: 'border-red-200',
    iconColor: 'text-red-600',
  },
  info: {
    icon: Info,
    colors: 'border-blue-200',
    iconColor: 'text-blue-600',
  },
};

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  variant = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  contentClassName,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const variantConfig = MODAL_VARIANTS[variant];
  const VariantIcon = variantConfig.icon;

  // Handle mounting/unmounting for SSR
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management and body scroll
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus the modal
    setTimeout(() => {
      modalRef.current?.focus();
    }, 100);

    return () => {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // Handle animations
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle focus trap
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black bg-opacity-50 backdrop-blur-sm",
        "transition-all duration-300",
        isAnimating ? "opacity-100" : "opacity-0",
        overlayClassName
      )}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full bg-white rounded-lg shadow-lg",
          "transform transition-all duration-300",
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0",
          MODAL_SIZES[size],
          variantConfig.colors,
          size === 'full' ? 'h-full' : 'max-h-[90vh]',
          className
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex items-start space-x-3">
              {VariantIcon && (
                <VariantIcon className={cn("h-6 w-6 mt-0.5", variantConfig.iconColor)} />
              )}
              <div>
                {title && (
                  <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="mt-1 text-sm text-gray-600">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-4 p-2 hover:bg-gray-100"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(
          "overflow-auto",
          size === 'full' ? 'flex-1' : 'max-h-[calc(90vh-200px)]',
          contentClassName
        )}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Modal sub-components
export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-200", className)}>
      {children}
    </div>
  );
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn(
      "px-6 py-4 border-t border-gray-200 bg-gray-50",
      "flex items-center justify-end space-x-3",
      className
    )}>
      {children}
    </div>
  );
}

// Confirmation Modal Hook
export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    title: '',
    message: '',
  });

  const confirm = (options: typeof config) => {
    setConfig(options);
    setIsOpen(true);
    
    return new Promise<boolean>((resolve) => {
      const handleConfirm = () => {
        options.onConfirm?.();
        setIsOpen(false);
        resolve(true);
      };

      const handleCancel = () => {
        options.onCancel?.();
        setIsOpen(false);
        resolve(false);
      };

      // Update config with promise handlers
      setConfig(prev => ({
        ...prev,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      }));
    });
  };

  const ConfirmModal = () => (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title={config.title}
      variant={config.variant}
      size="sm"
    >
      <ModalBody>
        <p className="text-gray-700">{config.message}</p>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="outline"
          onClick={config.onCancel}
        >
          {config.cancelText || 'Cancel'}
        </Button>
        <Button
          variant={config.variant === 'error' ? 'destructive' : 'primary'}
          onClick={config.onConfirm}
        >
          {config.confirmText || 'Confirm'}
        </Button>
      </ModalFooter>
    </Modal>
  );

  return { confirm, ConfirmModal };
}

// Alert Modal Hook
export function useAlertModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    buttonText?: string;
    onClose?: () => void;
  }>({
    title: '',
    message: '',
  });

  const alert = (options: typeof config) => {
    setConfig(options);
    setIsOpen(true);
  };

  const handleClose = () => {
    config.onClose?.();
    setIsOpen(false);
  };

  const AlertModal = () => (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={config.title}
      variant={config.variant}
      size="sm"
    >
      <ModalBody>
        <p className="text-gray-700">{config.message}</p>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleClose}
          className="ml-auto"
        >
          {config.buttonText || 'OK'}
        </Button>
      </ModalFooter>
    </Modal>
  );

  return { alert, AlertModal };
} 