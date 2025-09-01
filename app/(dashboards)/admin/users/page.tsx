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
  Filter, 
  Eye, 
  Shield, 
  UserCheck, 
  UserX,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER';
  isVerified: boolean;
  createdAt: string;
  seller?: {
    id: string;
    shopName: string;
    isApproved: boolean;
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
  const user = useUser();
  const { isLoading, isAuthenticated } = useAuthStore();

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
        setError(response.error?.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
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
        Verified
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">
        <UserX className="w-3 h-3 mr-1" />
        Unverified
      </Badge>
    );
  };

  // Show loading state while user data is being fetched
  if (isLoading || !isAuthenticated) {
    return (
      <DashboardLayout title="Loading..." description="Please wait...">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wrench-accent"></div>
            <p className="text-gray-600">Loading...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage all platform users and their permissions</p>
          </div>
          <Button 
            onClick={fetchUsers} 
            variant="outline" 
            leftIcon={<RefreshCw className="h-4 w-4" />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Users
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search by name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Filter
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => handleRoleFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wrench-accent focus:border-transparent"
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SELLER">Seller</option>
                    <option value="BUYER">Buyer</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button type="submit" variant="primary" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
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
              Users ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-accent"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchUsers} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
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
                          <span className="text-sm text-gray-500">Shop:</span>
                          <span className="text-sm font-medium">{user.seller.shopName}</span>
                          <Badge className={user.seller.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {user.seller.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                        View
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
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} users
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
