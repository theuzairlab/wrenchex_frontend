'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUser, useUserRole } from '@/lib/stores/auth';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  Search, 
  Eye, 
  EyeOff,
  Shield, 
  UserCheck, 
  UserX,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    shopName: string;
    shopDescription?: string;
    shopAddress?: string;
    city?: string;
    area?: string;
    latitude?: number;
    longitude?: number;
    isApproved: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
      products: number;
      services: number;
      appointments: number;
    };
  };
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminUsersPage() {
  const role = useUserRole();
  const { isLoading, isAuthenticated } = useAuthStore();
  const t = useTranslations('adminUsers');

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Form states
  const [createAdminForm, setCreateAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN') {
      fetchUsers();
    }
  }, [isAuthenticated, role, currentPage, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getAdminUsers({
        role: roleFilter || undefined,
        search: search || undefined,
        page: currentPage,
        limit: 10
      });

      if (response.success && response.data) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || t('fetchUsersFailed'));
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || t('fetchUsersFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleFilterChange = (newRole: string) => {
    setRoleFilter(newRole);
    setCurrentPage(1);
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await apiClient.getUserById(userId);
      if (response.success && response.data) {
        setSelectedUser(response.data.user);
        setShowUserModal(true);
      } else {
        toast.error(response.error?.message || t('fetchUserFailed'));
      }
    } catch (err: any) {
      toast.error(err.message || t('fetchUserFailed'));
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      setIsUpdatingRole(true);
      const response = await apiClient.updateUserRole(userId, newRole);
      if (response.success) {
        toast.success(t('roleUpdatedSuccessfully'));
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole as 'ADMIN' | 'SELLER' | 'BUYER' } : user
        ));
        // Update selected user if it's the same
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, role: newRole as 'ADMIN' | 'SELLER' | 'BUYER' } : null);
        }
      } else {
        toast.error(response.error?.message || t('updateRoleFailed'));
      }
    } catch (err: any) {
      toast.error(err.message || t('updateRoleFailed'));
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreatingAdmin(true);
      const response = await apiClient.createAdminUser(createAdminForm);
      if (response.success) {
        toast.success(t('adminCreatedSuccessfully'));
        setShowCreateAdminModal(false);
        setCreateAdminForm({ firstName: '', lastName: '', email: '', password: '' });
        fetchUsers(); // Refresh the list
      } else {
        toast.error(response.error?.message || t('createAdminFailed'));
      }
    } catch (err: any) {
      toast.error(err.message || t('createAdminFailed'));
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { color: 'bg-red-100 text-red-800', icon: Shield },
      SELLER: { color: 'bg-blue-100 text-blue-800', icon: UserCheck },
      BUYER: { color: 'bg-green-100 text-green-800', icon: Users }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.BUYER;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    );
  };

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge className="bg-green-100 text-green-800">
        <UserCheck className="w-3 h-3 mr-1" />
{t('verified')}
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">
        <UserX className="w-3 h-3 mr-1" />
{t('unverified')}
      </Badge>
    );
  };

  // Show loading state while user data is being fetched
  if (isLoading || !isAuthenticated) {
    return (
      <DashboardLayout title={t('loadingTitle')} description={t('pleaseWait')}>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  
  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('userManagement')}</h1>
            <p className="text-gray-600">{t('manageUsersDescription')}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCreateAdminModal(true)}
              variant="primary" 
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t('createAdminUser')}
            </Button>
            <Button 
              onClick={fetchUsers} 
              variant="outline" 
              leftIcon={<RefreshCw className="h-4 w-4" />}
              disabled={loading}
            >
              {t('refresh')}
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('searchUsers')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder={t('searchByNameOrEmail')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('roleFilter')}</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => handleRoleFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
                  >
                    <option value="">{t('allRoles')}</option>
                    <option value="ADMIN">{t('admin')}</option>
                    <option value="SELLER">{t('seller')}</option>
                    <option value="BUYER">{t('buyer')}</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button type="submit" variant="primary" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    {t('search')}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('usersCount', {count: pagination.total})}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-accent"></div>
                  <p className="text-gray-600">{t('loadingUsers')}</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchUsers} variant="outline">
                  {t('tryAgain')}
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('noUsersFound')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </h3>
                        {getRoleBadge(user.role)}
                        {getVerificationBadge(user.isVerified)}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      {user.seller && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-gray-500">{t('shop')}:</span>
                          <span className="text-sm font-medium">{user.seller.shopName}</span>
                          <Badge className={user.seller.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {user.seller.isApproved ? t('approved') : t('pending')}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<Eye className="h-4 w-4" />}
                        onClick={() => handleViewUser(user.id)}
                      >
                        {t('view')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {t('showingUsersRange', {from: ((pagination.page - 1) * pagination.limit) + 1, to: Math.min(pagination.page * pagination.limit, pagination.total), total: pagination.total})}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('previous')}
                  </Button>
                  
                  <span className="text-sm text-gray-600">{t('pageOf', {page: currentPage, pages: pagination.pages})}</span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                  >
                    {t('next')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('userDetails')}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowUserModal(false)}
                leftIcon={<X className="h-4 w-4" />}
              >
                {t('close')}
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('firstName')}</label>
                  <p className="text-gray-900">{selectedUser?.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastName')}</label>
                  <p className="text-gray-900">{selectedUser?.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                  <p className="text-gray-900">{selectedUser?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                  <p className="text-gray-900">{selectedUser?.phone || t('notProvided')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('role')}</label>
                  <div className="flex items-center gap-2">
                    {selectedUser && getRoleBadge(selectedUser.role)}
                    <select
                      value={selectedUser?.role || ''}
                      onChange={(e) => selectedUser && handleUpdateUserRole(selectedUser.id, e.target.value)}
                      disabled={isUpdatingRole}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="ADMIN">{t('admin')}</option>
                      <option value="SELLER">{t('seller')}</option>
                      <option value="BUYER">{t('buyer')}</option>
                    </select>
                    {isUpdatingRole && <span className="text-xs text-gray-500">{t('updating')}...</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
                  {selectedUser && getVerificationBadge(selectedUser.isVerified)}
                </div>
              </div>

              {/* Seller Info */}
              {selectedUser?.seller && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">{t('sellerInformation')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('shopName')}</label>
                      <p className="text-gray-900">{selectedUser?.seller?.shopName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('shopStatus')}</label>
                      <Badge className={selectedUser?.seller?.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {selectedUser?.seller?.isApproved ? t('approved') : t('pending')}
                      </Badge>
                    </div>
                    {selectedUser?.seller?.shopDescription && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('shopDescription')}</label>
                        <p className="text-gray-900">{selectedUser.seller.shopDescription}</p>
                      </div>
                    )}
                    {selectedUser?.seller?.shopAddress && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('shopAddress')}</label>
                        <p className="text-gray-900">{selectedUser.seller.shopAddress}</p>
                      </div>
                    )}
                    {selectedUser?.seller?.city && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')}</label>
                        <p className="text-gray-900">{selectedUser.seller.city}</p>
                      </div>
                    )}
                    {selectedUser?.seller?.area && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('area')}</label>
                        <p className="text-gray-900">{selectedUser.seller.area}</p>
                      </div>
                    )}
                    {selectedUser?.seller?._count && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('sellerStats')}</label>
                        <div className="flex gap-4 text-sm">
                          <span>{t('products')}: {selectedUser.seller._count.products}</span>
                          <span>{t('services')}: {selectedUser.seller._count.services}</span>
                          <span>{t('appointments')}: {selectedUser.seller._count.appointments}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">{t('accountInformation')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('createdAt')}</label>
                    <p className="text-gray-900">{selectedUser && new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastUpdated')}</label>
                    <p className="text-gray-900">{selectedUser && new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin User Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('createAdminUser')}</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCreateAdminModal(false)}
                leftIcon={<X className="h-4 w-4" />}
              >
                {t('close')}
              </Button>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('firstName')} *
                </label>
                <Input
                  type="text"
                  value={createAdminForm.firstName}
                  onChange={(e) => setCreateAdminForm({ ...createAdminForm, firstName: e.target.value })}
                  required
                  placeholder={t('enterFirstName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lastName')} *
                </label>
                <Input
                  type="text"
                  value={createAdminForm.lastName}
                  onChange={(e) => setCreateAdminForm({ ...createAdminForm, lastName: e.target.value })}
                  required
                  placeholder={t('enterLastName')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email')} *
                </label>
                <Input
                  type="email"
                  value={createAdminForm.email}
                  onChange={(e) => setCreateAdminForm({ ...createAdminForm, email: e.target.value })}
                  required
                  placeholder={t('enterEmail')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('password')} *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={createAdminForm.password}
                    onChange={(e) => setCreateAdminForm({ ...createAdminForm, password: e.target.value })}
                    required
                    placeholder={t('enterPassword')}
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCreateAdminModal(false)}
                >
                  {t('cancel')}
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-1"
                  disabled={isCreatingAdmin}
                >
                  {isCreatingAdmin ? t('creating') : t('createAdminUser')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
