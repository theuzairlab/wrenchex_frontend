'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  User, 
  Calendar,
  Package,
  Search
} from 'lucide-react';

interface MessagesInboxProps {
  conversations: any[];
  unreadCount: number;
  onRefresh: () => void;
}

export function MessagesInbox({ conversations, unreadCount, onRefresh }: MessagesInboxProps) {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrderMessages = async (orderId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await apiClient.getChatMessages(orderId);
      if (response.success) {
        setMessages(response.data?.messages || []);
        // Mark as read - TODO: implement when API is available
        // await apiClient.markOrderMessagesAsRead(orderId);
        onRefresh(); // Refresh to update unread count
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    try {
      setIsSending(true);
      const response = await apiClient.sendMessage(
        selectedConversation.orderId,
        { chatId: selectedConversation.orderId, message: newMessage.trim() }
      );
      
      if (response.success) {
        setNewMessage('');
        // Reload messages
        await loadOrderMessages(selectedConversation.orderId);
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.buyerName?.toLowerCase().includes(query) ||
      conv.orderNumber?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations ({conversations.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.orderId}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    loadOrderMessages(conversation.orderId);
                  }}
                  className={`w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                    selectedConversation?.orderId === conversation.orderId ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {conversation.buyerName || 'Customer'}
                      </span>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Package className="h-3 w-3" />
                    <span>Order #{conversation.orderNumber}</span>
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.message}
                    </p>
                  )}
                  
                  {conversation.lastMessageAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(conversation.lastMessageAt)}
                    </p>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No conversations found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Message threads will appear here when customers contact you about orders.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedConversation ? (
              <div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {selectedConversation.buyerName || 'Customer'}
                </div>
                <p className="text-sm font-normal text-gray-600 mt-1">
                  Order #{selectedConversation.orderNumber}
                </p>
              </div>
            ) : (
              <span className="text-gray-500">Select a conversation</span>
            )}
          </CardTitle>
        </CardHeader>
        
        {selectedConversation ? (
          <>
            <CardContent className="flex-1 p-4">
              <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
                {isLoadingMessages ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wrench-orange-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === selectedConversation.sellerId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === selectedConversation.sellerId
                            ? 'bg-wrench-orange-500 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === selectedConversation.sellerId
                              ? 'text-orange-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No messages yet</p>
                    <p className="text-gray-500 text-xs">Start the conversation below</p>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="gap-2"
                >
                  {isSending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}