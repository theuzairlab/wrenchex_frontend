'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { ProductChat, ProductMessage, MessageType } from '@/types';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TypingIndicator, TypingBubble } from './TypingIndicator';

interface ChatInterfaceProps {
  chatId: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [chat, setChat] = useState<ProductChat | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();
  const {
    socket,
    isConnected,
    sendMessage: sendWebSocketMessage,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
    onMessageReceived,
    onTypingStart,
    onTypingStop
  } = useWebSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadChat();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  // WebSocket setup
  useEffect(() => {
    if (!isConnected || !chat) return;

    // Join the chat room with product ID
    joinChat(chatId, chat.productId);

    // Set up message receiver
    onMessageReceived((newMessage: ProductMessage) => {
      setChat(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), newMessage]
        };
      });
    });

    // Set up typing indicators
    onTypingStart((typingUserInfo, chatId) => {
      if (typingUserInfo.userId !== user?.id) {
        setIsTyping(true);
        setTypingUser(`${typingUserInfo.firstName} ${typingUserInfo.lastName}`);
      }
    });

    onTypingStop((typingUserInfo, chatId) => {
      if (typingUserInfo.userId !== user?.id) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    return () => {
      leaveChat(chatId);
      // Clean up typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId, isConnected, user, chat]);

  // Auto-scroll when typing indicator appears/disappears
  useEffect(() => {
    scrollToBottom();
  }, [isTyping]);

  const loadChat = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getChatById(chatId);
      
      if (response.success && response.data) {
        setChat(response.data.chat);
        // Mark as read
        await apiClient.markChatAsRead(chatId);
      }
    } catch (error: any) {
      console.error('Failed to load chat:', error);
      toast.error(error.message || 'Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageType: MessageType = 'TEXT') => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    const messageText = message;
    setMessage(''); // Clear input immediately
    
    // Stop typing indicator
    if (chat) stopTyping(chatId, chat.productId);

    if (isConnected && chat) {
      // Use WebSocket for real-time messaging
      sendWebSocketMessage(chatId, messageText, messageType, chat.productId);
      setIsSending(false);
    } else {
      // Fallback to HTTP API if WebSocket not connected
      try {
        const response = await apiClient.sendChatMessage(chatId, messageText, messageType);
        
        if (response.success && response.data) {
          // Add message to chat immediately for better UX
          setChat(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: [...(prev.messages || []), response.data as ProductMessage]
            };
          });
        }
      } catch (error: any) {
        console.error('Failed to send message:', error);
        toast.error(error.message || 'Failed to send message');
        setMessage(messageText); // Restore message on failure
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (!chat || !isConnected) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Trigger typing indicator if user is actively typing
    if (value.trim()) {
      startTyping(chatId, chat.productId);
      
      // Set a timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(chatId, chat.productId);
      }, 2000);
    } else {
      // Immediately stop typing if input is empty
      stopTyping(chatId, chat.productId);
    }
  };

  const formatMessageTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chat not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          {chat.product.images && chat.product.images.length > 0 && (
            <img
              src={chat.product.images[0]}
              alt={chat.product.title}
              className="w-12 h-12 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{chat.product.title}</h3>
            <p className="text-sm text-gray-600">
              AED {chat.product.price.toFixed(2)} • Chat with{' '}
              {user?.id === chat.sellerId 
                ? `${chat.buyer.firstName} ${chat.buyer.lastName}`
                : `${chat.seller.firstName} ${chat.seller.lastName}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          chat.messages.map((msg) => {
            const isMyMessage = msg.senderId === user?.id;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <Card className={`max-w-[70%] p-3 ${
                  isMyMessage 
                    ? 'bg-blue-600 text-gray-900' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {msg.messageType === 'PRICE_OFFER' && (
                    <div className="flex items-center gap-1 text-sm opacity-75 mb-1">
                      Price Offer
                    </div>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <div className={`text-xs mt-1 opacity-75 ${
                    isMyMessage ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(msg.createdAt)}
                    {!isMyMessage && ` • ${msg.sender.firstName}`}
                  </div>
                </Card>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {isTyping && typingUser && (
          <TypingBubble />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        {/* Connection Status */}
        <div className="mb-2 flex items-center justify-between">
          <TypingIndicator 
            isTyping={isTyping} 
            userName={typingUser || undefined} 
            className="text-xs"
          />
          <div className={`text-xs px-2 py-1 rounded-full ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? '🟢 Online' : '🔴 Offline'}
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="w-full">
          <Input
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isSending}
            className="w-full"
          />
          </div>          
          {/* Send as Price Offer */}
          {message.match(/^AED\d+(\.\d{1,2})?$/) && (
            <Button
              onClick={() => sendMessage('PRICE_OFFER')}
              disabled={isSending}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              AED
            </Button>
          )}
          
          {/* Send Button */}
          <Button
            onClick={() => sendMessage()}
            disabled={!message.trim() || isSending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send size={16} />
          </Button>
        </div>
        
        {message.match(/^AED\d+(\.\d{1,2})?$/) && (
          <p className="text-xs text-gray-500 mt-1">
            💡 Detected a price! Click the AED button to send as a price offer.
          </p>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;
