'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Product Chat</h1>
            <p className="text-gray-600">Chat with the seller about this product</p>
          </div>
          
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading chat...</div>
            </div>
          }>
            <ChatInterface chatId={chatId} />
          </Suspense>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default ChatPage;
