'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Heart,
  Star,
  TrendingUp,
  Calendar,
  MessageSquare,
  Bell,
  CreditCard,
  Shield,
  Database,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Wrench,
  Home,
  Search,
  FileText,
  Truck,
  User
} from 'lucide-react';
import { useUserRole } from '@/lib/stores/auth';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  children?: NavigationItem[];
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
  onLinkClick?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle, className, onLinkClick }: SidebarProps) {
  const role = useUserRole();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'management']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getNavigationItems = (): NavigationItem[] => {
    const commonItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: Home,
      },
    ];

    switch (role) {
      case 'BUYER':
        return [
          ...commonItems,
          {
            id: 'marketplace',
            label: 'Marketplace',
            icon: Search,
            children: [
              { id: 'browse-products', label: 'Browse Products', href: '/products', icon: Search },
              { id: 'browse-services', label: 'Browse Services', href: '/services', icon: Search },
            ],
          },
          {
            id: 'communication',
            label: 'Communication',
            icon: MessageSquare,
            children: [
              { id: 'chats', label: 'My Chats', href: '/buyer/chats', icon: MessageSquare },
            ],
          },
          {
            id: 'services',
            label: 'Services & Appointments',
            icon: Calendar,
            children: [
              { id: 'appointments', label: 'My Appointments', href: '/buyer/appointments', icon: Calendar },
              { id: 'book-service', label: 'Book Service', href: '/services', icon: Wrench },
            ],
          },
          {
            id: 'account',
            label: 'Account',
            icon: User,
            children: [
              { id: 'profile', label: 'Profile', href: '/buyer/profile', icon: User },
            ],
          },
        ];

      case 'SELLER':
        return [
          ...commonItems,
          {
            id: 'inventory',
            label: 'Products & Services',
            icon: Package,
            children: [
              { id: 'products', label: 'My Products', href: '/seller/products', icon: Package },
              { id: 'add-product', label: 'Add Product', href: '/seller/products/add', icon: Package },
              { id: 'services', label: 'My Services', href: '/seller/services', icon: Wrench },
            ],
          },
          {
            id: 'appointments',
            label: 'Appointments',
            icon: Calendar,
            children: [
              { id: 'appointments', label: 'All Appointments', href: '/seller/appointments', icon: Calendar },
              { id: 'availability', label: 'My Availability', href: '/seller/availability', icon: Calendar },
            ],
          },
          {
            id: 'communication',
            label: 'Products Chats',
            icon: MessageSquare,
            children: [
              { id: 'chats', label: 'Product Chats', href: '/seller/chats', icon: MessageSquare },
            ],
          },
          {
            id: 'business',
            label: 'Shop Profile',
            icon: TrendingUp,
            children: [
              { id: 'profile', label: 'Shop Profile', href: '/seller/profile', icon: User },
            ],
          },
        ];

      case 'ADMIN':
        return [
          ...commonItems,
          {
            id: 'platform',
            label: 'Platform Overview',
            icon: BarChart3,
            children: [
              { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
            ],
          },
          {
            id: 'users',
            label: 'User Management',
            icon: Users,
            children: [
              { id: 'users', label: 'All Users', href: '/admin/users', icon: Users },
              { id: 'sellers', label: 'Sellers', href: '/admin/sellers', icon: Users},
            ],
          },
          {
            id: 'content',
            label: 'Content Management',
            icon: Database,
            children: [
              { id: 'products', label: 'Products', href: '/admin/products', icon: Package },
              { id: 'categories', label: 'Categories', href: '/admin/categories', icon: Package },
              { id: 'services', label: 'Services', href: '/admin/services', icon: Wrench },
              { id: 'reviews', label: 'Reviews', href: '/admin/reviews', icon: Star },
            ],
          },
          {
            id: 'system',
            label: 'System Settings',
            icon: Settings,
            children: [
              { id: 'settings', label: 'General Settings', href: '/admin/settings', icon: Settings },
              { id: 'payments', label: 'Payment Settings', href: '/admin/payments', icon: CreditCard },
              { id: 'notifications', label: 'Notifications', href: '/admin/notifications', icon: Bell },
            ],
          },
        ];

      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  };

  const hasActiveChild = (children?: NavigationItem[]) => {
    if (!children) return false;
    return children.some(child => child.href && isActive(child.href));
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.id);
    const itemIsActive = item.href ? isActive(item.href) : hasActiveChild(item.children);

    if (hasChildren) {
      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleSection(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              level === 0 && "text-gray-700 hover:bg-gray-100",
              level > 0 && "text-gray-600 hover:bg-gray-50 ml-4",
              itemIsActive && "bg-wrench-accent text-black"
            )}
          >
            <div className="flex items-center">
              <item.icon className={cn(
                "h-5 w-5 mr-3",
                isCollapsed && "mr-0"
              )} />
              {!isCollapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex items-center">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            )}
          </button>

          {isExpanded && !isCollapsed && (
            <div className="space-y-1 ml-4">
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    if (item.href) {
      return (
        <Link
          key={item.id}
          href={item.href}
          onClick={onLinkClick}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            level === 0 && "text-gray-700 hover:bg-gray-100",
            level > 0 && "text-gray-600 hover:bg-gray-50 ml-4",
            isActive(item.href) && "bg-wrench-accent text-black"
          )}
        >
          <item.icon className={cn(
            "h-5 w-5 mr-3",
            isCollapsed && "mr-0"
          )} />
          {!isCollapsed && (
            <>
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Link>
      );
    }

    return null;
  };

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <p className="text-sm text-gray-500 capitalize">{role?.toLowerCase()} Panel</p>
            </div>
          )}
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Package className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navigationItems.map(item => renderNavigationItem(item))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/help"
          onClick={onLinkClick}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <HelpCircle className={cn(
            "h-5 w-5 mr-3",
            isCollapsed && "mr-0"
          )} />
          {!isCollapsed && <span>Help & Support</span>}
        </Link>
      </div>
    </div>
  );
} 