'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Package, X } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { useWebSocket } from '@/hooks/useWebSocket';

interface ChatDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onConversationClick?: (chatId: string) => void;
}

export function ChatDropdown({ isOpen, onClose, triggerRef, onConversationClick }: ChatDropdownProps) {
  const { user } = useAuthStore();
  const { isConnected } = useWebSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations
  const loadChatData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const chatsResponse = await apiClient.getUserChats();
      
      if (chatsResponse.success && chatsResponse.data) {
        const allChats = chatsResponse.data.chats || [];
        
        // Filter for user's conversations (buyer or seller)
        const userChats = allChats.filter((chat: any) => 
          chat.buyerId === user?.id || chat.sellerId === user?.id
        );

        // Sort by recent activity and unread messages
        const sortedChats = userChats.sort((a: any, b: any) => {
          // First priority: unread messages
          const aUnread = a.unreadCount || 0;
          const bUnread = b.unreadCount || 0;
          
          if (aUnread > 0 && bUnread === 0) return -1;
          if (aUnread === 0 && bUnread > 0) return 1;
          
          // Second priority: recent activity
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        // Take only recent conversations (max 5)
        setConversations(sortedChats.slice(0, 5));
      }
    } catch (err: any) {
      console.error('Failed to load chat data:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadChatData();
    }
  }, [isOpen]);

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!isConnected || !isOpen) return;

    // Listen for new messages and update conversations
    const handleNewMessage = () => {
      loadChatData();
    };

    // Set up WebSocket message listener
    const socket = (window as any).socket;
    if (socket) {
      socket.on('new_message', handleNewMessage);
      
      return () => {
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [isConnected, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-chat-dropdown]')
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // Get display name for conversation
  const getConversationName = (chat: any) => {
    if (user?.id === chat.buyerId) {
      return `${chat.seller.firstName} ${chat.seller.lastName}`;
    } else {
      return `${chat.buyer.firstName} ${chat.buyer.lastName}`;
    }
  };

  // Get last message preview
  const getLastMessage = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) return 'No messages yet';
    
    const lastMessage = chat.messages[0];
    const content = lastMessage.message || lastMessage.content || '';
    
    if (content.length > 50) {
      return content.substring(0, 50) + '...';
    }
    
    return content;
  };

  // Get chat route based on user role
  const getChatRoute = (chatId: string) => {
    if (user?.role === 'SELLER') {
      return `/seller/chats/${chatId}`;
    } else {
      return `/buyer/chats/${chatId}`;
    }
  };

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Handle conversation click - mark as read and notify parent
  const handleConversationClick = async (chatId: string, hasUnread: boolean) => {
    if (hasUnread) {
      try {
        // Mark chat as read
        await apiClient.markChatAsRead(chatId);
        
        // Update local state to remove unread count
        setConversations(prev => 
          prev.map(chat => 
            chat.id === chatId 
              ? { ...chat, unreadCount: 0 }
              : chat
          )
        );
        
        // Notify parent component to update unread count
        if (onConversationClick) {
          onConversationClick(chatId);
        }
      } catch (error) {
        console.error('Failed to mark chat as read:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      data-chat-dropdown
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${
        conversations.some(chat => (chat.unreadCount || 0) > 0) 
          ? 'bg-gradient-to-r from-red-50 to-white' 
          : ''
      }`}>
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">Recent Conversations</h3>
          {/* Total unread count badge */}
          {(() => {
            const totalUnread = conversations.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
            return totalUnread > 0 ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              </div>
            ) : null;
          })()}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wrench-orange-500 mx-auto mb-2"></div>
            Loading conversations...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p className="text-sm">{error}</p>
            <button 
              onClick={loadChatData}
              className="mt-2 text-xs text-wrench-orange-500 hover:text-wrench-orange-600 underline"
            >
              Try again
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs text-gray-400 mt-1">Start chatting about products!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((chat) => (
              <Link
                key={chat.id}
                href={getChatRoute(chat.id)}
                onClick={() => {
                  handleConversationClick(chat.id, (chat.unreadCount || 0) > 0);
                  onClose();
                }}
                className={`block p-4 transition-colors ${
                  (chat.unreadCount || 0) > 0 
                    ? 'bg-blue-50 border-l-4 border-l-blue-500 hover:bg-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                      {chat.product?.images && chat.product.images.length > 0 ? (
                        <img
                          src={chat.product.images[0]}
                          alt={chat.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-full h-full p-2 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getConversationName(chat)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {getRelativeTime(chat.updatedAt)}
                        </span>
                        {(chat.unreadCount || 0) > 0 && (
                          <span className="bg-wrench-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {chat.product?.title || 'Product'}
                    </p>
                    
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {getLastMessage(chat)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <Link
            href={user?.role === 'SELLER' ? '/seller/chats' : '/buyer/chats'}
            onClick={onClose}
            className="text-sm text-wrench-orange-600 hover:text-wrench-orange-700 font-medium"
          >
            View All Conversations
          </Link>
          {/* Total unread count in footer */}
          {(() => {
            const totalUnread = conversations.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
            return totalUnread > 0 ? (
              <span className="text-xs text-gray-600">
                {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
              </span>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
}
