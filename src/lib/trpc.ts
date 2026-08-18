import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';

import { mockData } from '@/src/data/mockData';
import { Cart, CartItem } from '@/src/types';

// --- ZUSTAND STORE ---
interface CartState {
  cartId: string | null;
  setCartId: (id: string | null) => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartId: localStorage.getItem('guestCartId') || null,
  setCartId: (id) => {
    if (id) {
      localStorage.setItem('guestCartId', id);
    } else {
      localStorage.removeItem('guestCartId');
    }
    set({ cartId: id });
  },
  isDrawerOpen: false,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
}));

// --- MOCK DATA & TYPES ---
let mockCart: Cart = {
  id: 'cart_123',
  currency: 'USD',
  items: [
    {
      id: 'item_1',
      variantId: 'v1',
      quantity: 1,
      unitPrice: 45.00,
      product: { name: 'Lumina Glow Serum', slug: 'lumina-glow-serum', primaryCategory: 'face' },
      variant: { name: '30ml', sku: 'LGS-30', attributes: [] },
      image: { imageUrl: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bd1db224-b438-47b5-8cb4-6744fbdc7fa2_800w.jpg' }
    }
  ]
};

// --- MOCK TRPC ---
export const trpc = {
  products: {
    bySlug: {
      useQuery: ({ slug }: { slug: string }) => {
        return useQuery({
          queryKey: ['product', slug],
          queryFn: async () => {
            await new Promise(r => setTimeout(r, 500));
            return mockData.productDetails;
          }
        });
      }
    }
  },
  account: {
    wishlistAdd: { useMutation: () => ({ mutate: () => console.log('Added to wishlist') }) },
    wishlistRemove: { useMutation: () => ({ mutate: () => console.log('Removed from wishlist') }) }
  },
  cart: {
    get: {
      useQuery: () => {
        return useQuery({
          queryKey: ['cart'],
          queryFn: async () => {
            await new Promise(r => setTimeout(r, 500));
            return mockCart;
          }
        });
      }
    },
    addItem: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async ({ variantId, quantity }: { variantId: string, quantity: number }) => {
            await new Promise(r => setTimeout(r, 300));
            // Mock adding item
            const existingItem = mockCart.items.find(i => i.variantId === variantId);
            if (existingItem) {
              existingItem.quantity += quantity;
            } else {
              mockCart.items.push({
                id: `item_${Math.random()}`,
                variantId,
                quantity,
                unitPrice: 45.00,
                product: { name: 'New Product', slug: 'new-product', primaryCategory: 'face' },
                variant: { name: 'Default', sku: 'NEW-1', attributes: [] },
                image: { imageUrl: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bd1db224-b438-47b5-8cb4-6744fbdc7fa2_800w.jpg' }
              });
            }
            return mockCart;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
          }
        });
      }
    },
    updateItem: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async ({ itemId, quantity }: { itemId: string, quantity: number }) => {
            await new Promise(r => setTimeout(r, 300));
            const item = mockCart.items.find(i => i.id === itemId);
            if (item) item.quantity = quantity;
            return mockCart;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
          }
        });
      }
    },
    removeItem: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async ({ itemId }: { itemId: string }) => {
            await new Promise(r => setTimeout(r, 300));
            mockCart.items = mockCart.items.filter(i => i.id !== itemId);
            return mockCart;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
          }
        });
      }
    },
    mergeGuestCart: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async ({ anonymousCartId, userCartId }: { anonymousCartId: string, userCartId: string }) => {
            await new Promise(r => setTimeout(r, 500));
            return mockCart;
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
          }
        });
      }
    }
  },
  checkout: {
    summary: {
      useMutation: () => {
        return useMutation({
          mutationFn: async ({ 
            discountCode, 
            shippingMethod = 'eco', 
            giftPackaging = false,
            pointsRedeemed = 0 
          }: { 
            discountCode?: string; 
            shippingMethod?: string;
            giftPackaging?: boolean;
            pointsRedeemed?: number;
          }) => {
            await new Promise(r => setTimeout(r, 200));
            const subtotal = mockCart.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
            
            let discount = 0;
            const code = discountCode?.trim().toUpperCase();
            if (code === 'SAVE10' || code === 'LUMINA10') {
              discount = Math.min(10, subtotal);
            } else if (code === 'GLOW20') {
              discount = Number((subtotal * 0.2).toFixed(2));
            } else if (code === 'WELCOME50') {
              discount = Math.min(15, subtotal);
            } else if (code === 'BOTANICAL') {
              discount = Number((subtotal * 0.15).toFixed(2));
            } else if (code) {
              throw new Error('Invalid discount code. Try LUMINA10, GLOW20, or WELCOME50.');
            }

            let shipping = 0;
            if (shippingMethod === 'express') shipping = 12.00;
            else if (shippingMethod === 'chilled') shipping = 24.00;

            const packagingFee = giftPackaging ? 5.00 : 0;
            const pointsDiscount = (pointsRedeemed / 10); // 10 pts = $1
            const effectiveDiscount = discount + pointsDiscount;
            const tax = Number(((subtotal - effectiveDiscount) * 0.075).toFixed(2));
            const total = Math.max(0, subtotal - effectiveDiscount + shipping + packagingFee + Math.max(0, tax));

            return {
              subtotal,
              discount,
              pointsDiscount,
              shipping,
              packagingFee,
              tax: Math.max(0, tax),
              total,
              gwp: subtotal >= 80 ? { variantId: 'gwp_1', name: 'Deluxe Mini Botanical Essence (15ml)' } : null
            };
          }
        });
      }
    },
    createOrder: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: any) => {
            await new Promise(r => setTimeout(r, 600));
            const orderId = `LUM-${Math.floor(100000 + Math.random() * 900000)}`;
            const orderRecord = {
              orderId,
              date: new Date().toISOString(),
              items: [...mockCart.items],
              data,
            };
            // Save to localStorage for rich confirmation view
            try {
              localStorage.setItem('lumina_last_order', JSON.stringify(orderRecord));
            } catch (e) {
              console.error(e);
            }
            mockCart.items = []; // clear cart
            return { orderId, success: true };
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
          }
        });
      }
    }
  }
};
