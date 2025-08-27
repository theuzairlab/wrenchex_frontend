'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/stores/auth';
import { ProductMessage, MessageType } from '@/types';

interface TypingUser {
  userId: string;
  firstName: string;
  lastName: string;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (chatId: string, message: string, messageType?: MessageType, productId?: string) => void;
  joinChat: (chatId: string, productId?: string) => void;
  leaveChat: (chatId: string) => void;
  startTyping: (chatId: string, productId?: string) => void;
  stopTyping: (chatId: string, productId?: string) => void;
  typingUsers: TypingUser[];
  onMessageReceived: (callback: (message: ProductMessage) => void) => void;
  onTypingStart: (callback: (user: TypingUser, chatId: string) => void) => void;
  onTypingStop: (callback: (user: TypingUser, chatId: string) => void) => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { user, getToken } = useAuthStore();
  
  const messageCallbackRef = useRef<((message: ProductMessage) => void) | null>(null);
  const typingStartCallbackRef = useRef<((user: TypingUser, chatId: string) => void) | null>(null);
  const typingStopCallbackRef = useRef<((user: TypingUser, chatId: string) => void) | null>(null);

  useEffect(() => {
    if (!user) return;

    // Create socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: false
    });

    setSocket(newSocket);

    // Connect and authenticate
    newSocket.connect();

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket');
      setIsConnected(true);
      
      // Authenticate with token
      const token = getToken();
      if (token) {
        newSocket.emit('authenticate', token);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
      setIsConnected(false);
    });

    newSocket.on('authenticated', (data) => {
      console.log('✅ WebSocket authenticated:', data.user);
    });

    newSocket.on('authentication_error', (error) => {
      console.error('❌ WebSocket authentication failed:', error);
    });

    // Message received
    newSocket.on('new_message', (data: { message: ProductMessage, chatId: string }) => {
      console.log('📨 New message received:', data);
      if (messageCallbackRef.current) {
        messageCallbackRef.current(data.message);
      }
    });

    // Typing indicators
    newSocket.on('user_typing', (data: { chatId: string, userId: string, userName?: string, isTyping: boolean }) => {
      console.log('✍️ User typing:', data);
      
      const [firstName, lastName] = (data.userName || 'User').split(' ');
      const typingUser: TypingUser = {
        userId: data.userId,
        firstName: firstName || 'User',
        lastName: lastName || ''
      };

      if (data.isTyping) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, typingUser];
        });
        
        if (typingStartCallbackRef.current) {
          typingStartCallbackRef.current(typingUser, data.chatId);
        }
      } else {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        
        if (typingStopCallbackRef.current) {
          typingStopCallbackRef.current(typingUser, data.chatId);
        }
      }
    });

    newSocket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, getToken]);

  const sendMessage = (chatId: string, message: string, messageType: MessageType = 'TEXT', productId?: string) => {
    if (!socket || !isConnected) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    socket.emit('send_message', {
      chatId,
      productId,
      message,
      messageType
    });
  };

  const joinChat = (chatId: string, productId?: string) => {
    if (!socket || !isConnected) return;
    
    // Join both chat room and product room
    socket.emit('join_chat', { chatId });
    if (productId) {
      socket.emit('join_product_chat', { productId });
    }
    console.log(`👥 Joined chat: ${chatId}`);
  };

  const leaveChat = (chatId: string) => {
    if (!socket || !isConnected) return;
    
    socket.emit('leave_chat', { chatId });
    console.log(`👋 Left chat: ${chatId}`);
  };

  const startTyping = (chatId: string, productId?: string) => {
    if (!socket || !isConnected) return;
    
    socket.emit('typing_start', { chatId, productId });
  };

  const stopTyping = (chatId: string, productId?: string) => {
    if (!socket || !isConnected) return;
    
    socket.emit('typing_stop', { chatId, productId });
  };

  const onMessageReceived = (callback: (message: ProductMessage) => void) => {
    messageCallbackRef.current = callback;
  };

  const onTypingStart = (callback: (user: TypingUser, chatId: string) => void) => {
    typingStartCallbackRef.current = callback;
  };

  const onTypingStop = (callback: (user: TypingUser, chatId: string) => void) => {
    typingStopCallbackRef.current = callback;
  };

  return {
    socket,
    isConnected,
    sendMessage,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
    typingUsers,
    onMessageReceived,
    onTypingStart,
    onTypingStop
  };
}
