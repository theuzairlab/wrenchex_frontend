'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageCircle, Clock, User, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { ProductChat } from '@/types';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useTokenValidation } from '@/hooks/useTokenValidation';

function SellerChatsPage() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('sellerChats');
  const [chats, setChats] = useState<ProductChat[]>([]);
  const [filteredChats, setFilteredChats] = useState<ProductChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  const router = useRouter();
  
  // Token validation hook
  const { isValidating } = useTokenValidation({
    showToast: true,
    autoRefresh: true
  });

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = chats.filter(chat =>
        chat.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.buyer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.buyer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [searchTerm, chats]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUserChats();
      
      if (response.success && response.data) {
        const allChats = response.data.chats || [];
        
        // Filter to show only chats where the current user is the seller
        const sellerChats = allChats.filter(chat => 
          chat.sellerId === user?.id
        );
        
        setChats(sellerChats);
      }
    } catch (error: any) {
      console.error('Failed to load chats:', error);
      toast.error(error.message || t('failedToLoadChats'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/${currentLocale}/seller/chats/${chatId}`);
  };

  if (isLoading || isValidating) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">
                {isValidating ? 'Validating session...' : t('loadingChats')}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="text-blue-600 h-5 w-5 sm:h-6 sm:w-6" />
              {t('productChats')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {t('manageConversationsDescription')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-500">
              {t('conversationsCount', { count: filteredChats.length })}
            </span>
            <Button 
              onClick={loadChats}
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto"
            >
              {t('refresh')}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9 sm:pl-10 text-sm sm:text-base"
          />
        </div>

        {/* Chats List */}
        {filteredChats.length === 0 ? (
          <Card className="p-4 sm:p-8 text-center">
            <MessageCircle className="mx-auto mb-4 text-gray-400 h-8 w-8 sm:h-12 sm:w-12" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? t('noChatsFound') : t('noCustomerChatsYet')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {searchTerm 
                ? t('noChatsMatch', { searchTerm })
                : t('customerConversationsWillAppearHere')
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => router.push(`/${currentLocale}/seller/products/add`)}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                {t('addProducts')}
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredChats.map((chat) => {
              const lastMessage = chat.messages[chat.messages.length - 1];
              const hasUnread = chat.unreadCount && chat.unreadCount > 0;

              return (
                <Card
                  key={chat.id}
                  className={`p-3 sm:p-4 cursor-pointer transition-all hover:shadow-lg ${
                    hasUnread ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Product Image */}
                    {chat.product?.images && chat.product.images.length > 0 ? (
                      <img
                        src={chat.product.images[0]}
                        alt={chat.product.title}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="text-gray-400 h-4 w-4 sm:h-6 sm:w-6" />
                      </div>
                    )}

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {chat.product?.title || t('productChat')}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {t('customer')}: {chat.buyer?.firstName} {chat.buyer?.lastName}
                          </p>
                          {lastMessage && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                              <span className="font-medium">
                                {lastMessage.senderId === user?.id ? t('you') + ': ' : t('customer') + ': '}
                              </span>
                              {lastMessage.messageType === 'PRICE_OFFER' && '💰 '}
                              {lastMessage.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-2">
                          {hasUnread && (
                            <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                              {t('newMessages', { count: chat.unreadCount || 0 })}
                            </span>
                          )}
                          {lastMessage && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-3 sm:w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default SellerChatsPage;
