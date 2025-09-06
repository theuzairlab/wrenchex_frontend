'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { useAuthModal } from '@/components/auth';

interface ChatWithSellerButtonProps {
  productId: string;
  sellerId: string;
  sellerPhone?: string;
  showPhone?: boolean;
  className?: string;
}

export function ChatWithSellerButton({ 
  productId, 
  sellerId, 
  sellerPhone, 
  showPhone = false,
  className = '' 
}: ChatWithSellerButtonProps) {
  const [isStartingChat, setIsStartingChat] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      // Open auth modal instead of redirecting
      openAuthModal('login');
      return;
    }

    if (user?.id === sellerId) {
      toast.error('You cannot chat with yourself');
      return;
    }

    setIsStartingChat(true);
    
    try {
      const response = await apiClient.startProductChat({
        productId: productId,
        message: 'Hi! I\'m interested in this product.'
      });
      
      if (response.success && response.data) {
        toast.success('Chat started successfully!');
        // Ensure we have a valid chat ID
        const chatId = (response.data as any).chat?.id || response.data.id;
        if (chatId) {
          router.push(`/buyer/chats/${chatId}`);
        } else {
          console.error('No chat ID received from API:', response.data);
          toast.error('Chat started but could not navigate to chat');
        }
      }
    } catch (error: any) {
      console.error('Failed to start chat:', error);
      toast.error(error.message || 'Failed to start chat');
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleCall = () => {
    if (!sellerPhone) {
      toast.error('Phone number not available');
      return;
    }
    
    // Open phone dialer
    window.open(`tel:${sellerPhone}`, '_self');
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Chat Button */}
      <Button
        onClick={handleStartChat}
        disabled={isStartingChat}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <MessageCircle size={18} />
        {isStartingChat ? 'Starting...' : 'Chat with Seller'}
      </Button>

      {/* Call Button - only show if phone is available and seller allows it */}
      {showPhone && sellerPhone && (
        <Button
          onClick={handleCall}
          variant="outline"
          className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 min-w-[100px]"
        >
          <Phone size={18} />
          Call
        </Button>
      )}
    </div>
  );
}

export default ChatWithSellerButton;
