'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast icons
const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

// Toast colors
const toastColors = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    text: 'text-green-800',
    button: 'text-green-600 hover:text-green-700',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-800',
    button: 'text-red-600 hover:text-red-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    text: 'text-yellow-800',
    button: 'text-yellow-600 hover:text-yellow-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800',
    button: 'text-blue-600 hover:text-blue-700',
  },
  loading: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'text-gray-600',
    text: 'text-gray-800',
    button: 'text-gray-600 hover:text-gray-700',
  },
};

// Individual Toast Component
interface ToastComponentProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastComponent({ toast, onRemove }: ToastComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const Icon = toastIcons[toast.type];
  const colors = toastColors[toast.type];

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.persistent || toast.type === 'loading') return;

    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      handleRemove();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.duration, toast.persistent, toast.type]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  return (
    <div
      className={cn(
        "relative max-w-sm w-full rounded-lg border shadow-lg p-4 pointer-events-auto",
        "transform transition-all duration-300 ease-in-out",
        colors.bg,
        colors.border,
        isVisible && !isRemoving 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-full opacity-0 scale-95"
      )}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon 
            className={cn(
              "h-5 w-5", 
              colors.icon,
              toast.type === 'loading' && "animate-spin"
            )} 
          />
        </div>
        
        <div className="ml-3 w-0 flex-1">
          {toast.title && (
            <p className={cn("text-sm font-medium", colors.text)}>
              {toast.title}
            </p>
          )}
          <p className={cn(
            "text-sm",
            colors.text,
            toast.title ? "mt-1" : ""
          )}>
            {toast.message}
          </p>
          
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className={cn(
                  "text-sm font-medium underline hover:no-underline",
                  colors.button
                )}
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        {!toast.persistent && (
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleRemove}
              className={cn(
                "inline-flex rounded-md p-1.5 transition-colors",
                "hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2",
                colors.button
              )}
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Toast Container Component
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col space-y-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>,
    document.body
  );
}

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>();

  const addToast = (toast: Omit<Toast, 'id'>): string => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };
    
    setToasts(prev => [...(prev || []), newToast]);
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev?.filter(toast => toast.id !== id) || []);
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  const updateToast = (id: string, updates: Partial<Toast>) => {
    setToasts(prev => 
      prev?.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      ) || []
    );
  };

  const contextValue: ToastContextType = {
    toasts: toasts || [],
    addToast,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts || []} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toast context
export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

// Convenience hook with helper methods
export function useNotification() {
  const { addToast, removeToast, clearAllToasts } = useToast();

  const success = (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    return addToast({ ...options, type: 'success', message });
  };

  const error = (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    return addToast({ ...options, type: 'error', message, persistent: options?.persistent ?? true });
  };

  const warning = (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    return addToast({ ...options, type: 'warning', message });
  };

  const info = (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    return addToast({ ...options, type: 'info', message });
  };

  const loading = (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    return addToast({ ...options, type: 'loading', message, persistent: true });
  };

  const dismiss = (id: string) => {
    removeToast(id);
  };

  const dismissAll = () => {
    clearAllToasts();
  };

  // Promise-based loading toast
  const promise = async <T,>(
    promise: Promise<T>,
    {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> => {
    const loadingId = loading(loadingMessage);

    try {
      const result = await promise;
      dismiss(loadingId);
      
      const message = typeof successMessage === 'function' 
        ? successMessage(result) 
        : successMessage;
      success(message);
      
      return result;
    } catch (err) {
      dismiss(loadingId);
      
      const message = typeof errorMessage === 'function' 
        ? errorMessage(err) 
        : errorMessage;
      error(message);
      
      throw err;
    }
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    dismissAll,
    promise,
  };
}

// Pre-configured notification functions (can be used without hooks)
let globalToastHandler: ToastContextType | null = null;

export const setGlobalToastHandler = (handler: ToastContextType) => {
  globalToastHandler = handler;
};

export const toast = {
  success: (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    if (!globalToastHandler) {
      console.warn('Toast handler not initialized. Make sure ToastProvider is mounted.');
      return '';
    }
    return globalToastHandler.addToast({ ...options, type: 'success', message });
  },
  
  error: (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    if (!globalToastHandler) {
      console.warn('Toast handler not initialized. Make sure ToastProvider is mounted.');
      return '';
    }
    return globalToastHandler.addToast({ 
      ...options, 
      type: 'error', 
      message, 
      persistent: options?.persistent ?? true 
    });
  },
  
  warning: (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    if (!globalToastHandler) {
      console.warn('Toast handler not initialized. Make sure ToastProvider is mounted.');
      return '';
    }
    return globalToastHandler.addToast({ ...options, type: 'warning', message });
  },
  
  info: (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    if (!globalToastHandler) {
      console.warn('Toast handler not initialized. Make sure ToastProvider is mounted.');
      return '';
    }
    return globalToastHandler.addToast({ ...options, type: 'info', message });
  },
  
  loading: (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
    if (!globalToastHandler) {
      console.warn('Toast handler not initialized. Make sure ToastProvider is mounted.');
      return '';
    }
    return globalToastHandler.addToast({ ...options, type: 'loading', message, persistent: true });
  },
  
  dismiss: (id: string) => {
    if (!globalToastHandler) return;
    globalToastHandler.removeToast(id);
  },
  
  dismissAll: () => {
    if (!globalToastHandler) return;
    globalToastHandler.clearAllToasts();
  },
}; 