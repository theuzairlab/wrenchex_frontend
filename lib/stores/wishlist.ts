import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  type: 'product' | 'service';
  title: string;
  price: number;
  image: string;
  category?: string;
  sellerName?: string;
  addedAt: Date;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (id: string, type: 'product' | 'service') => void;
  isInWishlist: (id: string, type: 'product' | 'service') => boolean;
  clearWishlist: () => void;
  getProducts: () => WishlistItem[];
  getServices: () => WishlistItem[];
  getCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(
          existing => existing.id === item.id && existing.type === item.type
        );
        
        if (!existingItem) {
          set({
            items: [...items, { ...item, addedAt: new Date() }]
          });
        }
      },
      
      removeItem: (id, type) => {
        const { items } = get();
        set({
          items: items.filter(
            item => !(item.id === id && item.type === type)
          )
        });
      },
      
      isInWishlist: (id, type) => {
        const { items } = get();
        return items.some(item => item.id === id && item.type === item.type);
      },
      
      clearWishlist: () => {
        set({ items: [] });
      },
      
      getProducts: () => {
        const { items } = get();
        return items.filter(item => item.type === 'product');
      },
      
      getServices: () => {
        const { items } = get();
        return items.filter(item => item.type === 'service');
      },
      
      getCount: () => {
        const { items } = get();
        return items.length;
      }
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert string dates back to Date objects after rehydration
          state.items = state.items.map(item => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }));
        }
      }
    }
  )
);
