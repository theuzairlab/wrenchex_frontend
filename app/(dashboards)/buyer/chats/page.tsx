'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MessageCircle, Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { ProductChat } from '@/types';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

function ChatsPage() {
  const [chats, setChats] = useState<ProductChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('buyerChats');
  const tCurrency = useTranslations('common.currency');

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUserChats();
      
      if (response.success && response.data) {
        setChats(response.data.chats);
      }
    } catch (error: any) {
      console.error('Failed to load chats:', error);
      toast.error(error.message || t('loadChatsFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/${currentLocale}/buyer/chats/${chatId}`);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">{t('loadingChats')}</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              <span className="text-lg sm:text-2xl">{t('yourChats')}</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {t('manageConversations')}
            </p>
          </div>

          {chats.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center">
              <MessageCircle className="mx-auto mb-4 text-gray-400 h-10 w-10 sm:h-12 sm:w-12" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {t('noChatsYet')}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {t('startChattingWithSellers')}
              </p>
              <Button 
                onClick={() => router.push(`/${currentLocale}/products`)}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <span className="text-sm sm:text-base">{t('browseProducts')}</span>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => {
                const otherParticipant = user?.id === chat.sellerId ? chat.buyer : chat.seller;
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
                      {chat.product.images && chat.product.images.length > 0 ? (
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
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                              {chat.product.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                              {user?.id === chat.sellerId ? t('buyer') : t('seller')}:{' '}
                              {otherParticipant.firstName} {otherParticipant.lastName}
                            </p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${
                              hasUnread ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {chat.unreadCount} {t('unreadMessages')}
                            </span>
                            <span className="text-sm sm:text-lg font-bold text-green-600">
                              {tCurrency('aed')} {chat.product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Last Message */}
                        {lastMessage ? (
                          <div className="mt-2 sm:mt-3">
                            <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 break-words">
                              {lastMessage.senderId === user?.id ? t('you') + ': ' : ''}
                              {lastMessage.messageType === 'PRICE_OFFER' && '💰 '}
                              {lastMessage.message}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock size={10} className="text-gray-400 sm:h-3 sm:w-3" />
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-500 mt-2">{t('noMessagesYet')}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default ChatsPage;
