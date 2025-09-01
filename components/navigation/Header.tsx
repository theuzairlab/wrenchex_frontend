'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  User, 
  Menu, 
  X, 
  Wrench,
  LogOut,
  Settings,
  Heart,
  Package,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore, useUser, useUserRole } from '@/lib/stores/auth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { ChatDropdown } from './ChatDropdown';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const chatButtonRef = useRef<HTMLButtonElement | null>(null);

  const user = useUser();
  const role = useUserRole();
  const { logout, isAuthenticated, isLoading } = useAuthStore();
  const { isConnected } = useWebSocket();
  const router = useRouter();

  // Debug logging for header
  console.log('Header Debug:', { 
    user, 
    role, 
    isAuthenticated, 
    isLoading,
    userName: user?.firstName,
    userRole: user?.role,
    unreadChatCount
  });

  // Debug unread count changes
  useEffect(() => {
    console.log('Header: Unread chat count changed to:', unreadChatCount);
  }, [unreadChatCount]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    router.push('/auth/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  // Load unread chat count once on mount
  const loadUnreadChatCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await apiClient.getUnreadChatCount();
      
      console.log('Header: Chat count response:', response);
      
      if (response.success && response.data) {
        console.log('Header: Setting unread count to:', response.data.count);
        setUnreadChatCount(response.data.count);
      } else {
        console.log('Header: Failed to get chat count:', response);
      }
    } catch (error) {
      console.error('Failed to load unread chat count:', error);
    }
  }, [isAuthenticated]);

  // Toggle chat dropdown
  const toggleChatDropdown = () => {
    const newState = !isChatDropdownOpen;
    setIsChatDropdownOpen(newState);
    
    // Refresh chat count when opening dropdown
    if (newState) {
      console.log('Header: Opening chat dropdown, refreshing count');
      loadUnreadChatCount();
    }
  };

  // Close chat dropdown
  const closeChatDropdown = () => {
    setIsChatDropdownOpen(false);
  };



  // Handle conversation click from dropdown - update unread count
  const handleConversationClick = useCallback((chatId: string) => {
    console.log('Header: Conversation clicked, updating unread count');
    // Decrease unread count by 1 since this conversation was marked as read
    setUnreadChatCount(prev => Math.max(0, prev - 1));
  }, []);

  // Load chat count on mount and when authenticated
  useEffect(() => {
    console.log('Header: useEffect triggered - isAuthenticated:', isAuthenticated, 'user:', user);
    if (isAuthenticated && user?.id) {
      console.log('Header: Loading chat count...');
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
      console.log('Header: WebSocket unread count update received:', data);
      
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

  // Listen for page visibility changes to refresh chat count (only when needed)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Header: Page became visible, refreshing chat count');
        // Only refresh if we don't have a count or if it's been a while
        if (unreadChatCount === 0) {
          loadUnreadChatCount();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, unreadChatCount, loadUnreadChatCount]);

  const getRoleBasedLinks = () => {
    if (!isAuthenticated) return [];

    const baseLinks = [
      { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    ];

    switch (role) {
      case 'BUYER':
        return [
          ...baseLinks,
          { href: '/buyer/chats', label: 'My Chats', icon: MessageCircle },
        ];
      case 'SELLER':
        return [
          ...baseLinks,
          { href: '/seller/products', label: 'My Products', icon: Package },
          { href: '/seller/chats', label: 'My Chats', icon: MessageCircle },
          { href: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
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

  return (
    <header className={cn(
      "bg-white border-b border-gray-200 sticky top-0 z-50",
      className
    )}>
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-10 h-10 bg-wrench-accent rounded-lg flex items-center justify-center">
              <Wrench className="h-6 w-6 text-black" />
            </div>
            <span className="text-xl font-bold text-black hidden sm:block">
              WrenchEX
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search auto parts, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                  leftIcon={<Search className="h-5 w-5 text-gray-400" />}
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">   


            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </Button>

                                 {/* Chat Icon with Dropdown */}
                 {(role === 'BUYER' || role === 'SELLER') && (
                   <div className="relative">
                     <button
                       ref={chatButtonRef}
                       onClick={toggleChatDropdown}
                       className="relative p-2 rounded-md hover:bg-gray-100"
                       style={{ backgroundColor: 'rgba(0,255,0,0.1)' }}
                     >
                       <MessageCircle className="h-5 w-5" />
                       {/* Debug: Always show badge for testing */}
                       <span 
                         className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center z-10 font-bold"
                         
                       >
                         {unreadChatCount || '0'}
                       </span>
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

                {/* User Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden lg:block">
                      {isLoading ? 'Loading...' : (user?.firstName && user?.lastName) ? `${user.firstName} ${user.lastName}` : 'User'}
                    </span>
                  </Button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
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
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <link.icon className="h-4 w-4 mr-3" />
                          {link.label}
                        </Link>
                      ))}

                      <hr className="my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:!hidden" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-gray-200 p-4">
            <form onSubmit={handleSearch}>
              <Input
                type="text"
                placeholder="Search auto parts, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {/* Search Button */}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsMobileMenuOpen(false);
              }}
            >
              <Search className="h-5 w-5 mr-3" />
              Search
            </Button>

            {/* Browse Categories */}
            <Link href="/categories">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Categories
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="px-3 py-2 border-t border-gray-100 mt-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>  

                {/* Role-based Links */}
                {roleLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <link.icon className="h-5 w-5 mr-3" />
                      {link.label}
                    </Button>
                  </Link>
                ))}

                {/* Notifications */}
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="h-5 w-5 mr-3" />
                  Notifications
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* Settings */}
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Button>
                </Link>

                {/* Logout */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    variant="primary"
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 