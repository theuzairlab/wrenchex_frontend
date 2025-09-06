'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  User,
  Menu,
  X,
  Wrench,
  Package,
  Settings,
  LogOut,
  Heart,
  MessageCircle,
  Bell,
  BarChart3,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import GlobalSearch from '@/components/search/GlobalSearch';
import { useAuthStore, useUserRole } from '@/lib/stores/auth';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { ChatDropdown } from './ChatDropdown';
import { useAuthModal } from '@/components/auth';
import { HoverBorderGradient } from '../ui/hover-border-gradient';

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const { getCount: getWishlistCount } = useWishlistStore();
  const { isConnected } = useWebSocket();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const mobileSearchDropdownRef = useRef<HTMLDivElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const chatButtonRef = useRef<HTMLButtonElement | null>(null);
  const { openAuthModal } = useAuthModal();

  const role = useUserRole();
  const wishlistCount = getWishlistCount();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchDropdownOpen &&
        (
          (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) &&
          (mobileSearchDropdownRef.current && !mobileSearchDropdownRef.current.contains(event.target as Node))
        )
      ) {
        setIsSearchDropdownOpen(false);
      }

      // Close mobile menu when clicking outside
      if (
        isMobileMenuOpen &&
        !(event.target as Element).closest('[data-mobile-menu]')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Load unread chat count once on mount
  const loadUnreadChatCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await apiClient.getUnreadChatCount();

      if (response.success && response.data) {
        setUnreadChatCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to load unread chat count:', error);
    }
  }, [isAuthenticated]);

  // Load chat count on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Add a small delay to ensure user data is fully loaded
      const timer = setTimeout(() => {
        loadUnreadChatCount();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.id, loadUnreadChatCount]);

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!isConnected || !isAuthenticated) return;

    // Listen for unread count updates
    const handleUnreadCountUpdate = (data: { count: number, chatId?: string, userId?: string }) => {
      if (data.count !== undefined) {
        setUnreadChatCount(data.count);
      }
    };

    // Set up WebSocket unread count listener
    const socket = (window as any).socket;
    if (socket) {
      socket.on('unread_count_update', handleUnreadCountUpdate);

      return () => {
        socket.off('unread_count_update', handleUnreadCountUpdate);
      };
    }
  }, [isConnected, isAuthenticated]);

  // Toggle search dropdown
  const toggleSearchDropdown = () => {
    setIsSearchDropdownOpen(!isSearchDropdownOpen);
  };

  // Auth modal functions
  const handleOpenAuthModal = (type: 'login' | 'buyer-register' | 'seller-register') => {
    openAuthModal(type);
    setIsMobileMenuOpen(false);
  };

  // Navigation links for different user roles
  const navigationLinks = [
    {
      href: '/',
      label: 'Home',
    },
    {
      href: '/products',
      label: 'Products',
      icon: <Package className="h-4 w-4" />
    },
    {
      href: '/services',
      label: 'Services',
      icon: <Wrench className="h-4 w-4" />
    },
  ];

  const getRoleBasedLinks = () => {
    if (!isAuthenticated) return [];

    const baseLinks = [
      { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    ];

    switch (role) {
      case 'BUYER':
        return [
          ...baseLinks,
          { href: '/wishlist', label: 'Favorites', icon: Heart },
        ];
      case 'SELLER':
        return [
          ...baseLinks,
          { href: '/seller/products', label: 'My Products', icon: Package },
        ];
      case 'ADMIN':
        return [
          ...baseLinks,
          { href: '/admin/users', label: 'Users', icon: User },
          { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
          { href: '/admin/settings', label: 'Settings', icon: Settings },
        ];
      default:
        return baseLinks;
    }
  };

  const roleLinks = getRoleBasedLinks();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  // Toggle chat dropdown
  const toggleChatDropdown = () => {
    const newState = !isChatDropdownOpen;
    setIsChatDropdownOpen(newState);

    // Refresh chat count when opening dropdown
    if (newState) {
      loadUnreadChatCount();
    }
  };

  // Close chat dropdown
  const closeChatDropdown = () => {
    setIsChatDropdownOpen(false);
  };

  // Handle conversation click from dropdown - update unread count
  const handleConversationClick = useCallback((chatId: string) => {
    // Decrease unread count by 1 since this conversation was marked as read
    setUnreadChatCount(prev => Math.max(0, prev - 1));
  }, []);

  return (
    <nav className={cn(
      "sticky top-4 z-40 bg-white/40 w-auto md:w-[60%] lg:w-auto backdrop-blur-md border border-gray-200/50 rounded-full shadow-lg transition-all duration-200 mx-auto mt-4",
      isScrolled && "bg-white/45 shadow-md",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-wrench-accent rounded-lg flex items-center justify-center">
              <Wrench className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-bold text-black">WrenchEX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationLinks.map((link: any) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-wrench-accent/10 text-wrench-accent-dark"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                )}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Search Button */}
            <div className="relative" ref={searchDropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSearchDropdown}
                className="rounded-full"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Search Dropdown */}
              {isSearchDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-96 p-4" onMouseDown={(e) => e.stopPropagation()}>
                  <GlobalSearch
                    placeholder="Search products, services, or brands..."
                    className="w-full"
                    showFilters={true}
                    onSearch={() => setIsSearchDropdownOpen(false)}
                  />
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="rounded-full relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    2
                  </span>
                </Button>

                {/* Chat Icon with Dropdown */}
                {(role === 'BUYER' || role === 'SELLER') && (
                  <div className="relative">
                    <button
                      ref={chatButtonRef}
                      onClick={toggleChatDropdown}
                      className="relative p-2 rounded-full hover:bg-gray-100/50"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {/* Unread count badge */}
                      {unreadChatCount > 0 && (
                        <span
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center z-10 font-bold"
                        >
                          {unreadChatCount > 99 ? '99+' : unreadChatCount}
                        </span>
                      )}
                    </button>

                    {/* Chat Dropdown */}
                    <ChatDropdown
                      isOpen={isChatDropdownOpen}
                      onClose={closeChatDropdown}
                      triggerRef={chatButtonRef}
                      onConversationClick={handleConversationClick}
                    />
                  </div>
                )}

                <Link href="/wishlist">
                  <Button variant="ghost" size="sm" className="rounded-full relative">
                    <Heart className="h-4 w-4" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 rounded-full"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  </Button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {isLoading ? 'Loading...' : (user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : 'User'}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email || 'Loading email...'}</p>
                        <span className={cn(
                          "inline-block px-2 py-1 rounded-full text-xs font-medium mt-1",
                          role === 'ADMIN' && "bg-red-100 text-red-700",
                          role === 'SELLER' && "bg-green-100 text-green-700",
                          role === 'BUYER' && "bg-blue-100 text-blue-700",
                          !role && "bg-gray-100 text-gray-700"
                        )}>
                          {role?.toLowerCase() || 'loading...'}
                        </span>
                      </div>

                      {roleLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <link.icon className="h-4 w-4 mr-3" />
                          {link.label}
                        </Link>
                      ))}

                      <hr className="my-1 border-gray-200/50" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/wishlist">
                  <Button variant="ghost" size="sm" className="rounded-full relative">
                    <Heart className="h-4 w-4" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  className="!rounded-full"
                  onClick={() => handleOpenAuthModal('login')}
                >
                  Login
                </Button>
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className="dark:bg-black bg-white text-black dark:text-white flex items-center"
                >
                <Button
                  size="sm"
                  className="!rounded-full"
                  onClick={() => handleOpenAuthModal('seller-register')}
                >
                  <Plus className="h-4 w-4 mr-3" />
                  Sell
                </Button>
                </HoverBorderGradient>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSearchDropdown}
              // onClick={() => {
              //   setIsSearchDropdownOpen((prev) => {
              //     const next = !prev;
              //     if (next) setIsMobileMenuOpen(false);
              //     return next;
              //   });
              // }}
              className="rounded-full"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsMobileMenuOpen((prev) => {
                  const next = !prev;
                  if (next) setIsSearchDropdownOpen(false);
                  return next;
                });
              }}
              data-mobile-menu
              className="rounded-full"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Dropdown (overlay) */}
        {isSearchDropdownOpen && (
          <div ref={mobileSearchDropdownRef} className="lg:hidden absolute left-1/2 -translate-x-1/2 top-full mt-3 p-4 bg-white/95 backdrop-blur-md rounded-xl border border-gray-200/50 shadow-lg w-[92vw] max-w-[640px] z-[60]">
            <GlobalSearch
              placeholder="Search products..."
              className="w-full"
              autoFocus={true}
              showFilters={false}
              onSearch={() => setIsSearchDropdownOpen(false)}
            />
          </div>
        )}

        {/* Mobile Menu (overlay) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2 top-full mt-3 bg-white backdrop-blur-md rounded-xl border border-gray-200/50 shadow-lg py-4 w-[92vw] max-w-[640px] z-[60]" data-mobile-menu>
            <div className="space-y-1 px-4">
              {/* Mobile Navigation Links */}
              {navigationLinks.map((link: any) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    pathname === link.href
                      ? "bg-wrench-accent/10 text-wrench-accent-dark"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon && <span className="mr-3">{link.icon}</span>}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Auth Section */}
            <div className="px-4 py-3 border-t border-gray-200/50 mt-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 py-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* Mobile Chat Icon */}
                    {(role === 'BUYER' || role === 'SELLER') && (
                      <div className="px-4 py-2 border-b border-gray-100/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Chats</span>
                          {unreadChatCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold">
                              {unreadChatCount > 99 ? '99+' : unreadChatCount}
                            </span>
                          )}
                        </div>
                        <Link
                          href={role === 'SELLER' ? '/seller/chats' : '/buyer/chats'}
                          className="flex items-center mt-2 text-sm text-wrench-orange-600 hover:text-wrench-orange-700"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          View All Conversations
                        </Link>
                      </div>
                    )}

                    {roleLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/50"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <link.icon className="h-4 w-4 mr-3" />
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50/50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-center rounded-full"
                    onClick={() => handleOpenAuthModal('login')}
                  >
                    Login
                  </Button>
                  <HoverBorderGradient
                    containerClassName="rounded-full"
                    as="button"
                    className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                  >
                    <Button
                      className="w-full justify-center rounded-full"
                      onClick={() => handleOpenAuthModal('seller-register')}
                    >
                      <Plus className="h-4 w-4 mr-3" />
                      Sell
                    </Button>
                  </HoverBorderGradient>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;