'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  User,
  SidebarClose,
  SidebarIcon,
  Languages
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
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'management']);
  
  // Fallback translations
  const getTranslation = (key: string) => {
    const fallbackTranslations: Record<string, string> = {
      navigation: currentLocale === 'ar' ? 'التنقل' : 'Navigation',
      buyerPanel: currentLocale === 'ar' ? 'لوحة المشتري' : 'Buyer Panel',
      sellerPanel: currentLocale === 'ar' ? 'لوحة البائع' : 'Seller Panel',
      adminPanel: currentLocale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel',
      dashboard: currentLocale === 'ar' ? 'لوحة التحكم' : 'Dashboard',
      marketplace: currentLocale === 'ar' ? 'السوق' : 'Marketplace',
      browseProducts: currentLocale === 'ar' ? 'تصفح المنتجات' : 'Browse Products',
      browseServices: currentLocale === 'ar' ? 'تصفح الخدمات' : 'Browse Services',
      communication: currentLocale === 'ar' ? 'التواصل' : 'Communication',
      myChats: currentLocale === 'ar' ? 'محادثاتي' : 'My Chats',
      servicesAppointments: currentLocale === 'ar' ? 'الخدمات والمواعيد' : 'Services & Appointments',
      myAppointments: currentLocale === 'ar' ? 'مواعيدي' : 'My Appointments',
      bookService: currentLocale === 'ar' ? 'احجز خدمة' : 'Book Service',
      account: currentLocale === 'ar' ? 'الحساب' : 'Account',
      profile: currentLocale === 'ar' ? 'الملف الشخصي' : 'Profile',
      productsServices: currentLocale === 'ar' ? 'المنتجات والخدمات' : 'Products & Services',
      myProducts: currentLocale === 'ar' ? 'منتجاتي' : 'My Products',
      addProduct: currentLocale === 'ar' ? 'إضافة منتج' : 'Add Product',
      myServices: currentLocale === 'ar' ? 'خدماتي' : 'My Services',
      appointments: currentLocale === 'ar' ? 'المواعيد' : 'Appointments',
      allAppointments: currentLocale === 'ar' ? 'جميع المواعيد' : 'All Appointments',
      myAvailability: currentLocale === 'ar' ? 'توافقي' : 'My Availability',
      productsChats: currentLocale === 'ar' ? 'محادثات المنتجات' : 'Products Chats',
      productChats: currentLocale === 'ar' ? 'محادثات المنتج' : 'Product Chats',
      shopProfile: currentLocale === 'ar' ? 'ملف المتجر' : 'Shop Profile',
      translations: currentLocale === 'ar' ? 'الترجمات' : 'Translations',
      translationManagement: currentLocale === 'ar' ? 'إدارة الترجمات' : 'Translation Management',
      platformOverview: currentLocale === 'ar' ? 'نظرة عامة على المنصة' : 'Platform Overview',
      analytics: currentLocale === 'ar' ? 'التحليلات' : 'Analytics',
      userManagement: currentLocale === 'ar' ? 'إدارة المستخدمين' : 'User Management',
      allUsers: currentLocale === 'ar' ? 'جميع المستخدمين' : 'All Users',
      sellers: currentLocale === 'ar' ? 'البائعون' : 'Sellers',
      contentManagement: currentLocale === 'ar' ? 'إدارة المحتوى' : 'Content Management',
      products: currentLocale === 'ar' ? 'المنتجات' : 'Products',
      categories: currentLocale === 'ar' ? 'الفئات' : 'Categories',
      services: currentLocale === 'ar' ? 'الخدمات' : 'Services',
      reviews: currentLocale === 'ar' ? 'التقييمات' : 'Reviews',
      systemSettings: currentLocale === 'ar' ? 'إعدادات النظام' : 'System Settings',
      generalSettings: currentLocale === 'ar' ? 'الإعدادات العامة' : 'General Settings',
      notifications: currentLocale === 'ar' ? 'الإشعارات' : 'Notifications',
      helpSupport: currentLocale === 'ar' ? 'المساعدة والدعم' : 'Help & Support'
    };
    return fallbackTranslations[key] || key;
  };

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
        label: getTranslation('dashboard'),
        href: `/${currentLocale}/dashboard`,
        icon: Home,
      },
    ];

    switch (role) {
      case 'BUYER':
        return [
          ...commonItems,
          {
            id: 'marketplace',
            label: getTranslation('marketplace'),
            icon: Search,
            children: [
              { id: 'browse-products', label: getTranslation('browseProducts'), href: `/${currentLocale}/products`, icon: Search },
              { id: 'browse-services', label: getTranslation('browseServices'), href: `/${currentLocale}/services`, icon: Search },
            ],
          },
          {
            id: 'communication',
            label: getTranslation('communication'),
            icon: MessageSquare,
            children: [
              { id: 'chats', label: getTranslation('myChats'), href: `/${currentLocale}/buyer/chats`, icon: MessageSquare },
            ],
          },
          {
            id: 'services',
            label: getTranslation('servicesAppointments'),
            icon: Calendar,
            children: [
              { id: 'appointments', label: getTranslation('myAppointments'), href: `/${currentLocale}/buyer/appointments`, icon: Calendar },
              { id: 'book-service', label: getTranslation('bookService'), href: `/${currentLocale}/services`, icon: Wrench },
            ],
          },
          {
            id: 'account',
            label: getTranslation('account'),
            icon: User,
            children: [
              { id: 'profile', label: getTranslation('profile'), href: `/${currentLocale}/buyer/profile`, icon: User },
            ],
          },
        ];

      case 'SELLER':
        return [
          ...commonItems,
          {
            id: 'inventory',
            label: getTranslation('productsServices'),
            icon: Package,
            children: [
              { id: 'products', label: getTranslation('myProducts'), href: `/${currentLocale}/seller/products`, icon: Package },
              { id: 'add-product', label: getTranslation('addProduct'), href: `/${currentLocale}/seller/products/add`, icon: Package },
              { id: 'services', label: getTranslation('myServices'), href: `/${currentLocale}/seller/services`, icon: Wrench },
            ],
          },
          {
            id: 'appointments',
            label: getTranslation('appointments'),
            icon: Calendar,
            children: [
              { id: 'appointments', label: getTranslation('allAppointments'), href: `/${currentLocale}/seller/appointments`, icon: Calendar },
              { id: 'availability', label: getTranslation('myAvailability'), href: `/${currentLocale}/seller/availability`, icon: Calendar },
            ],
          },
          {
            id: 'communication',
            label: getTranslation('productsChats'),
            icon: MessageSquare,
            children: [
              { id: 'chats', label: getTranslation('productChats'), href: `/${currentLocale}/seller/chats`, icon: MessageSquare },
            ],
          },
          {
            id: 'business',
            label: getTranslation('shopProfile'),
            icon: TrendingUp,
            children: [
              { id: 'profile', label: getTranslation('shopProfile'), href: `/${currentLocale}/seller/profile`, icon: User },
            ],
          },
          {
            id: 'translations',
            label: getTranslation('translationManagement'),
            href: `/${currentLocale}/seller/translations`,
            icon: Languages,
          },
        ];

      case 'ADMIN':
        return [
          ...commonItems,
          {
            id: 'platform',
            label: getTranslation('platformOverview'),
            icon: BarChart3,
            children: [
              { id: 'analytics', label: getTranslation('analytics'), href: `/${currentLocale}/admin/analytics`, icon: BarChart3 },
            ],
          },
          {
            id: 'users',
            label: getTranslation('userManagement'),
            icon: Users,
            children: [
              { id: 'users', label: getTranslation('allUsers'), href: `/${currentLocale}/admin/users`, icon: Users },
              { id: 'sellers', label: getTranslation('sellers'), href: `/${currentLocale}/admin/sellers`, icon: Users},
            ],
          },
          {
            id: 'content',
            label: getTranslation('contentManagement'),
            icon: Database,
            children: [
              { id: 'products', label: getTranslation('products'), href: `/${currentLocale}/admin/products`, icon: Package },
              { id: 'categories', label: getTranslation('categories'), href: `/${currentLocale}/admin/categories`, icon: Package },
              { id: 'services', label: getTranslation('services'), href: `/${currentLocale}/admin/services`, icon: Wrench },
              { id: 'reviews', label: getTranslation('reviews'), href: `/${currentLocale}/admin/reviews`, icon: Star },
            ],
          },
          {
            id: 'system',
            label: getTranslation('systemSettings'),
            icon: Settings,
            children: [
              { id: 'settings', label: getTranslation('generalSettings'), href: `/${currentLocale}/admin/settings`, icon: Settings },
              { id: 'notifications', label: getTranslation('notifications'), href: `/${currentLocale}/admin/notifications`, icon: Bell },
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
              level > 0 && "text-gray-600 hover:bg-gray-50",
              currentLocale === 'ar' && level > 0 && "mr-4",
              currentLocale === 'en' && level > 0 && "ml-4",
              itemIsActive && "bg-wrench-accent text-black"
            )}
          >
            <div className={`flex items-center ${currentLocale === 'ar' ? 'flex-row-reverse' : ''}`}>
              <item.icon className={cn(
                "h-5 w-5",
                currentLocale === 'ar' ? 'ml-3' : 'mr-3',
                isCollapsed && "ml-0 mr-0"
              )} />
              {!isCollapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      "px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full",
                      currentLocale === 'ar' ? 'mr-2' : 'ml-2'
                    )}>
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
                  <ChevronRight className={cn(
                    "h-4 w-4",
                    currentLocale === 'ar' && "rotate-180"
                  )} />
                )}
              </div>
            )}
          </button>

          {isExpanded && !isCollapsed && (
            <div className={cn(
              "space-y-1",
              currentLocale === 'ar' ? "mr-4" : "ml-4"
            )}>
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
            level > 0 && "text-gray-600 hover:bg-gray-50",
            currentLocale === 'ar' && level > 0 && "mr-4",
            currentLocale === 'en' && level > 0 && "ml-4",
            isActive(item.href) && "bg-wrench-accent text-black"
          )}
        >
          <div className={`flex items-center ${currentLocale === 'ar' ? 'flex-row-reverse' : ''}`}>
            <item.icon className={cn(
              "h-5 w-5",
              currentLocale === 'ar' ? 'ml-3' : 'mr-3',
              isCollapsed && "ml-0 mr-0"
            )} />
            {!isCollapsed && (
              <>
                <span>{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    "px-2 py-1 text-xs bg-red-500 text-white rounded-full",
                    currentLocale === 'ar' ? 'mr-auto' : 'ml-auto'
                  )}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </div>
        </Link>
      );
    }

    return null;
  };

  const getRolePanelText = () => {
    switch (role) {
      case 'BUYER': return getTranslation('buyerPanel');
      case 'SELLER': return getTranslation('sellerPanel');
      case 'ADMIN': return getTranslation('adminPanel');
      default: return 'Panel';
    }
  };

  return (
    <div className={cn(
      "bg-white border-gray-200 flex flex-col h-screen transition-all duration-300",
      currentLocale === 'ar' ? 'border-l' : 'border-r',
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col">
        {onToggle && (
            <button
              onClick={onToggle}
              className={cn(
                "p-1 rounded-lg hover:bg-gray-100 transition-colors h-5 w-5 mb-2",
                currentLocale === 'ar' ? 'self-end' : 'self-start'
              )}
            >
              <SidebarIcon className="h-5 w-5" />
            </button>
          )}
          {!isCollapsed && (
            <div className={currentLocale === 'ar' ? 'text-right' : 'text-left'}>
              <h2 className="text-lg font-semibold text-gray-900">{getTranslation('navigation')}</h2>
              <p className="text-sm text-gray-500">{getRolePanelText()}</p>
            </div>
          )}
          
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto min-h-0">
        {navigationItems.map(item => renderNavigationItem(item))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <Link
          href={`/${currentLocale}/help`}
          onClick={onLinkClick}
          className={cn(
            "flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors",
            currentLocale === 'ar' ? 'flex-row-reverse' : ''
          )}
        >
          <HelpCircle className={cn(
            "h-5 w-5",
            currentLocale === 'ar' ? 'ml-3' : 'mr-3',
            isCollapsed && "ml-0 mr-0"
          )} />
          {!isCollapsed && <span>{getTranslation('helpSupport')}</span>}
        </Link>
      </div>
    </div>
  );
} 