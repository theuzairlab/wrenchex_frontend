'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ChatInterface from '@/components/chat/ChatInterface';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useTranslations } from 'next-intl';

function SellerChatPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('sellerChatDetail');
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
            {t('backToChats')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('customerChat')}</h1>
            <p className="text-gray-600">{t('chatWithCustomerDescription')}</p>
          </div>
        </div>
        
        {/* Chat Interface */}
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">{t('loadingChat')}</div>
          </div>
        }>
          <ChatInterface chatId={chatId} />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}

export default SellerChatPage;
