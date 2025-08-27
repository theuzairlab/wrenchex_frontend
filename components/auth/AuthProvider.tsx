'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshAuth = useAuthStore(state => state.refreshAuth);
  const token = useAuthStore(state => state.token);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Initializing...', { 
          hasToken: !!token, 
          isAuthenticated, 
          hasUser: !!user,
          userRole: user?.role,
          userName: user?.firstName
        });
        
        // Always try to refresh if we have a token but missing user data
        if (token && (!isAuthenticated || !user)) {
          console.log('AuthProvider: Refreshing auth - token exists but missing auth/user data');
          await refreshAuth();
        } else if (token && user) {
          console.log('AuthProvider: User data already loaded', {
            role: user.role,
            name: user.firstName
          });
        } else {
          console.log('AuthProvider: No token found, user not authenticated');
        }
        
        console.log('AuthProvider: Initialization complete');
      } catch (error) {
        console.error('AuthProvider: Initialization failed:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    // Only initialize once on mount  
    if (!isInitialized) {
      initializeAuth();
    }
  }, [token, isAuthenticated, user, refreshAuth, isInitialized]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-wrench-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4F142]"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 