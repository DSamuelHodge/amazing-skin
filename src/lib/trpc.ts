import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { create } from 'zustand';

import type { AppRouter } from '../../server/trpc/root';
import type { Cart, Product } from '@/src/types';

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

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});

type CheckoutSummary = {
  subtotal: number;
  discount: number;
  pointsDiscount: number;
  shipping: number;
  packagingFee: number;
  tax: number;
  total: number;
  gwp: { variantId: string; name: string } | null;
};

function invalidateCart(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: ['cart'] });
}

// Compatibility facade: keep existing UI hook names while calling the real tRPC router.
export const trpc = {
  products: {
    bySlug: {
      useQuery: ({ slug }: { slug: string }) => {
        return useQuery({
          queryKey: ['product', slug],
          queryFn: async (): Promise<Product> =>
            (await trpcClient.catalog.getProductBySlug.query({ slug })) as Product,
        });
      },
    },
  },
  catalog: {
    getProducts: {
      useQuery: (input?: {
        categorySlug?: string;
        search?: string;
        limit?: number;
        cursor?: string;
      }) => {
        return useQuery({
          queryKey: ['catalog', 'products', input],
          queryFn: () => trpcClient.catalog.getProducts.query(input),
        });
      },
    },
  },
  account: {
    wishlistAdd: {
      useMutation: () => {
        return useMutation({
          mutationFn: (input?: { productId?: string }) =>
            trpcClient.customer.toggleWishlist.mutate(input),
        });
      },
    },
    wishlistRemove: {
      useMutation: () => {
        return useMutation({
          mutationFn: (input?: { productId?: string }) =>
            trpcClient.customer.toggleWishlist.mutate(input),
        });
      },
    },
  },
  customer: {
    me: {
      useQuery: () =>
        useQuery({
          queryKey: ['customer', 'me'],
          queryFn: () => trpcClient.customer.me.query(),
        }),
    },
    orders: {
      useQuery: () =>
        useQuery({
          queryKey: ['customer', 'orders'],
          queryFn: () => trpcClient.customer.orders.query(),
        }),
    },
    addresses: {
      list: {
        useQuery: () =>
          useQuery({
            queryKey: ['customer', 'addresses'],
            queryFn: () => trpcClient.customer.addresses.list.query(),
          }),
      },
      create: {
        useMutation: () => {
          const queryClient = useQueryClient();
          return useMutation({
            mutationFn: (input: Parameters<typeof trpcClient.customer.addresses.create.mutate>[0]) =>
              trpcClient.customer.addresses.create.mutate(input),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] }),
          });
        },
      },
      remove: {
        useMutation: () => {
          const queryClient = useQueryClient();
          return useMutation({
            mutationFn: (input: { id: string }) => trpcClient.customer.addresses.remove.mutate(input),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] }),
          });
        },
      },
      setDefault: {
        useMutation: () => {
          const queryClient = useQueryClient();
          return useMutation({
            mutationFn: (input: { id: string; type: 'shipping' | 'billing' }) =>
              trpcClient.customer.addresses.setDefault.mutate(input),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] }),
          });
        },
      },
    },
    updateSkinProfile: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: (input: {
            primarySkinType: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';
            skinConcerns: string[];
          }) => trpcClient.customer.updateSkinProfile.mutate(input),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer', 'me'] }),
        });
      },
    },
    wishlist: {
      list: {
        useQuery: () =>
          useQuery({
            queryKey: ['customer', 'wishlist'],
            queryFn: () => trpcClient.customer.wishlist.list.query(),
          }),
      },
      toggle: {
        useMutation: () => {
          const queryClient = useQueryClient();
          return useMutation({
            mutationFn: (input: { productId: string }) =>
              trpcClient.customer.wishlist.toggle.mutate(input),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer', 'wishlist'] }),
          });
        },
      },
    },
  },
  cart: {
    get: {
      useQuery: () => {
        return useQuery({
          queryKey: ['cart'],
          queryFn: async (): Promise<Cart> =>
            (await trpcClient.cart.get.query()) as Cart,
        });
      },
    },
    addItem: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (input: { variantId: string; quantity: number }): Promise<Cart> =>
            (await trpcClient.cart.addItem.mutate(input)) as Cart,
          onSuccess: () => {
            void invalidateCart(queryClient);
          },
        });
      },
    },
    updateItem: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (input: { itemId: string; quantity: number }): Promise<Cart> =>
            (await trpcClient.cart.updateItem.mutate(input)) as Cart,
          onSuccess: () => {
            void invalidateCart(queryClient);
          },
        });
      },
    },
    removeItem: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (input: { itemId: string }): Promise<Cart> =>
            (await trpcClient.cart.removeItem.mutate(input)) as Cart,
          onSuccess: () => {
            void invalidateCart(queryClient);
          },
        });
      },
    },
    mergeGuestCart: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (input: {
            anonymousCartId: string;
            userCartId: string;
          }): Promise<Cart> => (await trpcClient.cart.mergeGuestCart.mutate(input)) as Cart,
          onSuccess: () => {
            void invalidateCart(queryClient);
          },
        });
      },
    },
  },
  checkout: {
    summary: {
      useMutation: () => {
        return useMutation({
          mutationFn: async (input?: {
            discountCode?: string;
            shippingMethod?: string;
            giftPackaging?: boolean;
            pointsRedeemed?: number;
          }): Promise<CheckoutSummary> =>
            (await trpcClient.checkout.summary.mutate(input)) as CheckoutSummary,
        });
      },
    },
    createOrder: {
      useMutation: () => {
        const queryClient = useQueryClient();
        return useMutation({
          mutationFn: async (data: any) => {
            const result = await trpcClient.checkout.createOrder.mutate(data);
            try {
              localStorage.setItem(
                'lumina_last_order',
                JSON.stringify({
                  orderId: result.orderId,
                  date: new Date().toISOString(),
                  items: result.items?.length ? result.items : data?.items ?? [],
                  data,
                }),
              );
            } catch (e) {
              console.error(e);
            }
            return { orderId: result.orderId as string, success: true as const };
          },
          onSuccess: () => {
            void invalidateCart(queryClient);
          },
        });
      },
    },
  },
};
