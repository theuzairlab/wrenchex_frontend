'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUserRole } from '@/lib/stores/auth';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  MessageSquare, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Store, 
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface Chat {
  id: string;
  createdAt: string;
  isActive: boolean;
  product: {
    id: string;
    title: string;
  };
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    messages: number;
  };
}

interface ChatsResponse {
  chats: Chat[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AdminChatsPage() {
  const role = useUserRole();
  const { isLoading, isAuthenticated } = useAuthStore();

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [deletingChat, setDeletingChat] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN') {
      fetchChats();
    }
  }, [isAuthenticated, role, currentPage, startDate, endDate]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getAdminChats({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit: 10
      });

      if (response.success && response.data) {
        setChats(response.data.chats);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || 'Failed to fetch chats');
      }
    } catch (err: any) {
      console.error('Error fetching chats:', err);
      setError(err.message || 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchChats();
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingChat(chatId);
      
      const response = await apiClient.deleteAdminChat(chatId);
      
      if (response.success) {
        // Remove the chat from local state
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        // Update pagination
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } else {
        setError(response.error?.message || 'Failed to delete chat');
      }
    } catch (err: any) {
      console.error('Error deleting chat:', err);
      setError(err.message || 'Failed to delete chat');
    } finally {
      setDeletingChat(null);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        Active
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">
        Inactive
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <h1 className="text-2xl font-bold text-gray-900">Chat Moderation</h1>
            <p className="text-gray-600">Monitor conversations and take moderation actions</p>
          </div>
          <Button 
            onClick={fetchChats} 
            variant="outline" 
            leftIcon={<RefreshCw className="h-4 w-4" />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    handleFilterChange();
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chats List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-accent"></div>
                  <p className="text-gray-600">Loading conversations...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchChats} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No conversations found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-medium text-gray-900">
                            {chat.product.title}
                          </h3>
                          {getStatusBadge(chat.isActive)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-700">Buyer</p>
                              <p className="text-gray-600">
                                {chat.buyer.firstName} {chat.buyer.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{chat.buyer.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-700">Seller</p>
                              <p className="text-gray-600">
                                {chat.seller.firstName} {chat.seller.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{chat.seller.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-700">Messages</p>
                              <p className="text-gray-600">{chat._count.messages}</p>
                              <p className="text-xs text-gray-500">Total exchanged</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-700">Started</p>
                              <p className="text-gray-600">{formatDate(chat.createdAt)}</p>
                              <p className="text-xs text-gray-500">Conversation began</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-fit">
                        <Button variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                          View Chat
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          leftIcon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDeleteChat(chat.id)}
                          disabled={deletingChat === chat.id}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {deletingChat === chat.id ? 'Deleting...' : 'Delete Chat'}
                        </Button>
                      </div>
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
                  {pagination.total} conversations
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

        {/* Warning Notice */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Moderation Guidelines</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Use chat deletion sparingly and only for conversations that violate platform policies. 
                  Deleted chats cannot be recovered and will remove all associated messages.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
