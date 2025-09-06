'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuth = true,
  redirectTo 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Check if authentication is required
    if (requireAuth && !isAuthenticated) {
      // Redirect to home page since auth is now handled via popups
      router.push(redirectTo || '/');
      return;
    }

    // Check role-based access
    if (requiredRole && user) {
      const hasAccess = Array.isArray(requiredRole) 
        ? requiredRole.includes(user.role)
        : user.role === requiredRole;

      if (!hasAccess) {
        // Redirect to the general dashboard - it handles role-based content
        const defaultRedirect = '/dashboard';
        router.push(redirectTo || defaultRedirect);
        return;
      }
    }
  }, [user, isAuthenticated, isLoading, requiredRole, requireAuth, router, pathname, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-wrench-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4F142]"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Don't render if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Don't render if role is required but user doesn't have access
  if (requiredRole && user) {
    const hasAccess = Array.isArray(requiredRole) 
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;

    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="ADMIN" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function SellerRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="SELLER" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function BuyerRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="BUYER" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function AuthenticatedRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth'>) {
  return (
    <ProtectedRoute requireAuth={true} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// Component to redirect authenticated users away from auth pages
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !isRedirecting) {
      setIsRedirecting(true);
      console.log('GuestRoute: Redirecting to dashboard');
      
      // Redirect all authenticated users to the general dashboard
      // The dashboard page handles role-based content internally
      const redirectTo = '/dashboard';
      router.push(redirectTo);
    }
  }, [isAuthenticated, user, router, isRedirecting]);

  // Show loading while auth is being checked or while redirecting
  if (isLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen bg-wrench-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4F142]"></div>
          <p className="text-gray-600">
            {isRedirecting ? 'Redirecting to dashboard...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 