'use client';

import { useParams, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('buyerChatDetail');

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href={`/${currentLocale}/buyer/chats`}>
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} />
{t('backToChats')}
            </Button>
          </Link>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('productChat')}</h1>
            <p className="text-gray-600">{t('chatWithSellerAboutProduct')}</p>
          </div>
          
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">{t('loadingChat')}</div>
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
