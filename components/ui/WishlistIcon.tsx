'use client';

import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/lib/stores/wishlist';
import { cn } from '@/lib/utils';

interface WishlistIconProps {
  id: string;
  type: 'product' | 'service';
  title: string;
  price: number;
  currency?: string;
  image: string;
  category?: string;
  sellerName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function WishlistIcon({
  id,
  type,
  title,
  price,
  currency,
  image,
  category,
  sellerName,
  className,
  size = 'md'
}: WishlistIconProps) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  
  const isWishlisted = isInWishlist(id, type);
  
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeItem(id, type);
    } else {
      addItem({
        id,
        type,
        title,
        price,
        currency,
        image,
        category,
        sellerName
      });
    }
  };
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <button
      onClick={handleToggleWishlist}
      className={cn(
        'absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-200 hover:scale-110',
        isWishlisted 
          ? 'bg-red-500 text-white shadow-lg' 
          : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500',
        className
      )}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={cn(
          sizeClasses[size],
          isWishlisted ? 'fill-current' : 'fill-none'
        )}
      />
    </button>
  );
}
