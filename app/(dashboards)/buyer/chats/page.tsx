'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
      toast.error(error.message || 'Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/buyer/chats/${chatId}`);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading your chats...</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="text-blue-600" />
              Your Chats
            </h1>
            <p className="text-gray-600">
              Manage your conversations with sellers and buyers
            </p>
          </div>

          {chats.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No chats yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start chatting with sellers about products you're interested in!
              </p>
              <Button 
                onClick={() => router.push('/products')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Browse Products
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
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                      hasUnread ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      {chat.product.images && chat.product.images.length > 0 ? (
                        <img
                          src={chat.product.images[0]}
                          alt={chat.product.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <User className="text-gray-400" size={24} />
                        </div>
                      )}

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {chat.product.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {user?.id === chat.sellerId ? 'Buyer' : 'Seller'}:{' '}
                              {otherParticipant.firstName} {otherParticipant.lastName}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {hasUnread && (
                              <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                                {chat.unreadCount}
                              </span>
                            )}
                            <span className="text-lg font-bold text-green-600">
                              ${chat.product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Last Message */}
                        {lastMessage ? (
                          <div className="mt-2">
                            <p className="text-sm text-gray-700 truncate">
                              {lastMessage.senderId === user?.id ? 'You: ' : ''}
                              {lastMessage.messageType === 'PRICE_OFFER' && '💰 '}
                              {lastMessage.message}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-2">No messages yet</p>
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
