'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navigation/Navbar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle mobile menu close on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('[data-sidebar]') && !target.closest('[data-sidebar-toggle]')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <AuthenticatedRoute>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <Navbar className="flex-shrink-0" />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile Sidebar Toggle Button */}
          <div className="md:hidden fixed top-3 right-6 z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "bg-white border border-gray-200 rounded-lg p-2 shadow-lg hover:bg-gray-50 transition-all duration-200",
                isMobileMenuOpen && "bg-gray-100 border-gray-300"
              )}
              data-sidebar-toggle
              aria-label="Toggle sidebar menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

                     {/* Desktop Sidebar */}
           <div className="hidden md:block flex-shrink-0">
             <div className="h-full">
               <Sidebar 
                 isCollapsed={isSidebarCollapsed}
                 onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                 onLinkClick={() => setIsMobileMenuOpen(false)}
               />
             </div>
           </div>

          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden">
              <div 
                data-sidebar
                className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50"
              >
                {/* Mobile Sidebar Header with Close Button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                                 {/* Sidebar Content */}
                 <div className="h-full overflow-y-auto">
                   <Sidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
                 </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedRoute>
  );
} 