'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  ShoppingCart,
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
  ChevronDown,
  Store,
  Home,
  BookOpen,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui_backup/Dropdown';
import GlobalSearch from '@/components/search/GlobalSearch';
import { useAuthStore, useUserRole } from '@/lib/stores/auth';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { cn } from '@/lib/utils';

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout,  isLoading } = useAuthStore();
  const { getCount: getWishlistCount } = useWishlistStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const role = useUserRole();
  const wishlistCount = getWishlistCount();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current && 
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle search dropdown
  const toggleSearchDropdown = () => {
    setIsSearchDropdownOpen(!isSearchDropdownOpen);
  };

  // Navigation links for different user roles
  const navigationLinks = [
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
      {
        href: '/about',
        label: 'About',
        icon: <BookOpen className="h-4 w-4" />
      }
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
            { href: '/orders', label: 'My Orders', icon: Package },
            { href: '/favorites', label: 'Favorites', icon: Heart },
            { href: '/cart', label: 'Cart', icon: ShoppingCart },
          ];
        case 'SELLER':
          return [
            ...baseLinks,
            { href: '/seller/products', label: 'My Products', icon: Package },
            { href: '/seller/orders', label: 'Orders', icon: ShoppingCart },
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

    const handleLogout = () => {
      logout();
      setIsUserMenuOpen(false);
      router.push('/');
    };

  const currentLinks = isAuthenticated && user?.role
    // ? navigationLinks[user.role.toLowerCase() as keyof typeof navigationLinks] || navigationLinks.guest
    // : navigationLinks.guest;

  // User dropdown menu items
  const userDropdownItems = isAuthenticated ? [
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
      onClick: () => router.push('/profile'),
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Settings className="h-4 w-4" />,
      onClick: () => router.push('/dashboard'),
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageCircle className="h-4 w-4" />,
      onClick: () => router.push('/messages'),
    },
    {
      id: 'separator1',
      label: '',
      separator: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      onClick: () => router.push('/settings'),
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpCircle className="h-4 w-4" />,
      onClick: () => router.push('/help'),
    },
    {
      id: 'separator2',
      label: '',
      separator: true,
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="h-4 w-4" />,
      onClick: () => {
        logout();
        router.push('/');
      },
      danger: true,
    },
  ] : [];

  // Cart count (would come from cart store in real app)
  const cartCount = 3; // Mock value

  return (
    <nav className={cn(
      "sticky top-0 z-50 bg-white border-b border-gray-200 transition-all duration-200",
      isScrolled && "shadow-sm",
      className
    )}>
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-wrench-accent rounded-lg flex items-center justify-center">
              <Wrench className="h-5 w-5 lg:h-6 lg:w-6 text-black" />
            </div>
            <span className="text-lg lg:text-xl font-bold text-black">WrenchEX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationLinks.map((link: any) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-wrench-accent/10 text-wrench-accent-dark"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Global Search */}
          <div className="relative" ref={searchDropdownRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSearchDropdown}
                className="flex items-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>

              {/* Search Dropdown */}
              {isSearchDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
                >
                  <GlobalSearch
                    placeholder="Search products, services, or brands..."
                    className="w-full"
                    showFilters={true}
                    onSearch={() => setIsSearchDropdownOpen(false)}
                  />
                </div>
              )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    2
                  </span>
                </Button>

                {/* Cart (for buyers) */}
                {isAuthenticated && (
                  <>
                  <Link href="/wishlist">
                  <Button variant="ghost" size="sm" className="relative">
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </Link>
                </>
                )}

                {/* User Menu */}
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

                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>

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
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Search */}
            <Link href="/search">
              <Button variant="ghost" size="sm">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            {/* Mobile Cart */}
            {isAuthenticated &&  (
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-wrench-accent text-black text-xs rounded-full flex items-center justify-center font-medium">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {/* Mobile Navigation Links */}
              {navigationLinks.map((link: any) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    pathname === link.href
                      ? "bg-wrench-accent/10 text-wrench-accent-dark"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span className="ml-3">{link.label}</span>
                </Link>
              ))}

              {/* Mobile Search */}
              <div className="px-4 py-3">
                <GlobalSearch
                  placeholder="Search products..."
                  className="w-full"
                  autoFocus={false}
                  showFilters={false}
                />
              </div>

              {/* Mobile Auth Section */}
              <div className="px-4 py-3 border-t border-gray-200 mt-4">
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
                      <Link
                        href="/profile"
                        className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                          router.push('/');
                        }}
                        className="flex items-center w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/auth/login" className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register" className="block w-full">
                      <Button
                        className="w-full justify-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;