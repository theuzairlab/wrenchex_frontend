import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface UseTokenValidationOptions {
  onTokenExpired?: () => void;
  showToast?: boolean;
  autoRefresh?: boolean;
}

export function useTokenValidation(options: UseTokenValidationOptions = {}) {
  const { onTokenExpired, showToast = true, autoRefresh = true } = options;
  const { logout, isAuthenticated, user } = useAuthStore();
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Only validate if user is authenticated
    if (!isAuthenticated || !user) return;

    const validateToken = async () => {
      try {
        setIsValidating(true);
        console.log('TokenValidation: Validating token...');
        
        // Try to make a simple authenticated request
        await apiClient.getMe();
        
        console.log('TokenValidation: Token is valid');
      } catch (error: any) {
        console.warn('TokenValidation: Token validation failed:', error);
        
        if (error.message?.includes('Session expired') || error.message?.includes('token')) {
          if (showToast) {
            toast.error('Your session has expired. Please login again.');
          }
          
          if (onTokenExpired) {
            onTokenExpired();
          } else {
            logout();
          }
        }
      } finally {
        setIsValidating(false);
      }
    };

    // Validate token on mount
    if (autoRefresh) {
      validateToken();
    }

    // Listen for token expiration events
    const handleTokenExpiration = () => {
      console.log('TokenValidation: Token expiration event received');
      if (showToast) {
        toast.error('Your session has expired. Please login again.');
      }
      
      if (onTokenExpired) {
        onTokenExpired();
      } else {
        logout();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tokenExpired', handleTokenExpiration);
      
      return () => {
        window.removeEventListener('tokenExpired', handleTokenExpiration);
      };
    }
  }, [isAuthenticated, user, logout, onTokenExpired, showToast, autoRefresh]);

  return {
    isValidating,
    validateToken: async () => {
      setIsValidating(true);
      try {
        await apiClient.getMe();
        return true;
      } catch (error) {
        console.warn('TokenValidation: Manual validation failed:', error);
        return false;
      } finally {
        setIsValidating(false);
      }
    }
  };
}
