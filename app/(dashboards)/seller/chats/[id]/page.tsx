'use client';

import { useParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ChatInterface from '@/components/chat/ChatInterface';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function SellerChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Chats
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Chat</h1>
            <p className="text-gray-600">Chat with customer about your product</p>
          </div>
        </div>
        
        {/* Chat Interface */}
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading chat...</div>
          </div>
        }>
          <ChatInterface chatId={chatId} />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}

export default SellerChatPage;
