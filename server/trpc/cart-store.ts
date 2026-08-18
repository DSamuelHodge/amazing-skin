import { mockData } from '@/src/data/mockData';
import type { Cart, CartItem } from '@/src/types';

export interface StoredCart extends Cart {
  discountCode?: string | null;
}

const globalForCart = globalThis as typeof globalThis & {
  __luminaCarts?: Map<string, StoredCart>;
};

const carts = globalForCart.__luminaCarts ?? new Map<string, StoredCart>();
globalForCart.__luminaCarts = carts;

function defaultItem(): CartItem {
  const product = mockData.productDetails;
  const variant = product.variants[0];
  const image = product.images.find((img) => img.isPrimary) ?? product.images[0];
  return {
    id: 'item_1',
    variantId: variant.id,
    quantity: 1,
    unitPrice: variant.price,
    product: {
      name: product.name,
      slug: product.slug,
      primaryCategory: product.primaryCategory,
    },
    variant: {
      name: variant.name,
      sku: variant.sku,
      attributes: variant.attributes,
    },
    image: { imageUrl: image.imageUrl },
  };
}

export function createEmptyCart(sessionId: string): StoredCart {
  return {
    id: `cart_${sessionId.slice(0, 8)}`,
    currency: 'USD',
    items: [],
    discountCode: null,
  };
}

export function createDefaultCart(sessionId: string): StoredCart {
  return {
    ...createEmptyCart(sessionId),
    items: [defaultItem()],
  };
}

export function getSessionCart(sessionId: string): StoredCart {
  let cart = carts.get(sessionId);
  if (!cart) {
    cart = createDefaultCart(sessionId);
    carts.set(sessionId, cart);
  }
  return cart;
}

export function saveSessionCart(sessionId: string, cart: StoredCart): StoredCart {
  carts.set(sessionId, cart);
  return cart;
}

export function cloneCart(cart: StoredCart): StoredCart {
  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      product: { ...item.product },
      variant: { ...item.variant, attributes: [...item.variant.attributes] },
      image: { ...item.image },
    })),
  };
}
