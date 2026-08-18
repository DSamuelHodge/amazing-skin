import { and, asc, eq } from 'drizzle-orm';
import type { Cart, CartItem } from '@/src/types';
import { getDb, type AppDb } from '../../src/db/client';
import {
  carts,
  cartItems,
  categories,
  productImages,
  productVariants,
  products,
  variantAttributes,
} from '../../src/db/schema';

const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface PersistedCart extends Cart {
  discountCode?: string | null;
}

function money(value: string | number | null | undefined): number {
  if (value == null) return 0;
  return Number(value);
}

function expiryDate() {
  return new Date(Date.now() + CART_TTL_MS);
}

async function resolveVariant(db: AppDb, variantId: string) {
  let variant = UUID_RE.test(variantId)
    ? await db.query.productVariants.findFirst({ where: eq(productVariants.id, variantId) })
    : undefined;

  if (!variant) {
    const slug = variantId.startsWith('var_') ? variantId.slice(4) : variantId;
    const product = await db.query.products.findFirst({ where: eq(products.slug, slug) });
    if (product) {
      const [row] = await db
        .select()
        .from(productVariants)
        .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
        .orderBy(asc(productVariants.displayOrder))
        .limit(1);
      variant = row;
    }
  }

  if (!variant) return null;

  const product = await db.query.products.findFirst({ where: eq(products.id, variant.productId) });
  const category = product
    ? await db.query.categories.findFirst({ where: eq(categories.id, product.categoryId) })
    : undefined;
  const attrs = await db
    .select()
    .from(variantAttributes)
    .where(eq(variantAttributes.variantId, variant.id));
  const [image] = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, variant.productId))
    .orderBy(asc(productImages.displayOrder))
    .limit(1);

  return {
    variantId: variant.id,
    unitPrice: money(variant.price),
    stock: Math.max(0, variant.stockQuantity - variant.reservedQuantity),
    product: {
      name: product?.name ?? 'Product',
      slug: product?.slug ?? 'product',
      primaryCategory: category?.slug ?? 'face',
    },
    variant: {
      name: variant.name,
      sku: variant.sku,
      attributes: attrs.map((a) => ({
        attributeType: a.attributeType,
        value: a.value,
        hexCode: a.hexCode ?? undefined,
      })),
    },
    image: { imageUrl: image?.imageUrl ?? '' },
  };
}

async function availableStock(db: AppDb, variantId: string): Promise<number> {
  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, variantId),
  });
  if (!variant) return 0;
  return Math.max(0, variant.stockQuantity - variant.reservedQuantity);
}

export async function mapCart(db: AppDb, cartId: string): Promise<PersistedCart> {
  const cart = await db.query.carts.findFirst({ where: eq(carts.id, cartId) });
  if (!cart) {
    return { id: cartId, currency: 'USD', items: [], discountCode: null };
  }

  const rows = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.createdAt));

  const items: CartItem[] = [];
  for (const row of rows) {
    const meta = await resolveVariant(db, row.variantId);
    items.push({
      id: row.id,
      variantId: row.variantId,
      quantity: row.quantity,
      unitPrice: money(row.unitPrice),
      product: meta?.product ?? { name: 'Product', slug: 'product', primaryCategory: 'face' },
      variant: meta?.variant ?? { name: 'Default', sku: '', attributes: [] },
      image: meta?.image ?? { imageUrl: '' },
    });
  }

  return {
    id: cart.id,
    currency: cart.currency,
    items,
    discountCode: cart.appliedDiscountCode,
  };
}

export async function getOrCreateCart(opts: {
  sessionId: string;
  userId: string | null;
}): Promise<PersistedCart> {
  const db = await getDb();

  if (opts.userId) {
    const guest = await db.query.carts.findFirst({
      where: eq(carts.anonymousSessionId, opts.sessionId),
    });
    const userCart = await db.query.carts.findFirst({
      where: eq(carts.userId, opts.userId),
    });

    if (guest && userCart && guest.id !== userCart.id) {
      await mergeCartRows(db, guest.id, userCart.id);
      await db.delete(carts).where(eq(carts.id, guest.id));
      return mapCart(db, userCart.id);
    }

    if (guest && !userCart) {
      await db
        .update(carts)
        .set({
          userId: opts.userId,
          anonymousSessionId: null,
          updatedAt: new Date(),
          expiresAt: expiryDate(),
        })
        .where(eq(carts.id, guest.id));
      return mapCart(db, guest.id);
    }

    if (userCart) {
      await db
        .update(carts)
        .set({ updatedAt: new Date(), expiresAt: expiryDate() })
        .where(eq(carts.id, userCart.id));
      return mapCart(db, userCart.id);
    }
  } else {
    const existing = await db.query.carts.findFirst({
      where: eq(carts.anonymousSessionId, opts.sessionId),
    });
    if (existing) {
      await db
        .update(carts)
        .set({ updatedAt: new Date(), expiresAt: expiryDate() })
        .where(eq(carts.id, existing.id));
      return mapCart(db, existing.id);
    }
  }

  const [created] = await db
    .insert(carts)
    .values({
      userId: opts.userId,
      anonymousSessionId: opts.userId ? null : opts.sessionId,
      currency: 'USD',
      expiresAt: expiryDate(),
    })
    .returning();

  return mapCart(db, created.id);
}

async function mergeCartRows(db: AppDb, guestCartId: string, userCartId: string) {
  const guestItemRows = await db.select().from(cartItems).where(eq(cartItems.cartId, guestCartId));
  const userItemRows = await db.select().from(cartItems).where(eq(cartItems.cartId, userCartId));
  const userByVariant = new Map(userItemRows.map((item) => [item.variantId, item]));

  for (const guestItem of guestItemRows) {
    const stock = await availableStock(db, guestItem.variantId);
    const existing = userByVariant.get(guestItem.variantId);
    if (existing) {
      const nextQty = Math.min(existing.quantity + guestItem.quantity, Math.max(stock, existing.quantity));
      await db
        .update(cartItems)
        .set({ quantity: nextQty, updatedAt: new Date() })
        .where(eq(cartItems.id, existing.id));
    } else if (stock > 0) {
      await db.insert(cartItems).values({
        cartId: userCartId,
        variantId: guestItem.variantId,
        quantity: Math.min(guestItem.quantity, stock),
        unitPrice: guestItem.unitPrice,
        isFreeGift: guestItem.isFreeGift,
      });
    }
  }

  const guestCart = await db.query.carts.findFirst({ where: eq(carts.id, guestCartId) });
  const userCart = await db.query.carts.findFirst({ where: eq(carts.id, userCartId) });
  if (guestCart?.appliedDiscountCode && !userCart?.appliedDiscountCode) {
    await db
      .update(carts)
      .set({ appliedDiscountCode: guestCart.appliedDiscountCode, updatedAt: new Date() })
      .where(eq(carts.id, userCartId));
  }
}

export async function addCartItem(opts: {
  sessionId: string;
  userId: string | null;
  variantId: string;
  quantity: number;
}): Promise<PersistedCart> {
  const db = await getDb();
  const cart = await getOrCreateCart(opts);
  const meta = await resolveVariant(db, opts.variantId);
  if (!meta) {
    return cart;
  }
  const stock = meta.stock;

  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, meta.variantId)))
    .limit(1);

  if (existing) {
    const nextQty = Math.min(existing.quantity + opts.quantity, Math.max(stock, existing.quantity));
    await db
      .update(cartItems)
      .set({ quantity: nextQty, updatedAt: new Date() })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      cartId: cart.id,
      variantId: meta.variantId,
      quantity: Math.min(opts.quantity, Math.max(stock, 1)),
      unitPrice: String(meta.unitPrice),
    });
  }

  await db.update(carts).set({ updatedAt: new Date(), expiresAt: expiryDate() }).where(eq(carts.id, cart.id));
  return mapCart(db, cart.id);
}

export async function updateCartItem(opts: {
  sessionId: string;
  userId: string | null;
  itemId: string;
  quantity: number;
}): Promise<PersistedCart> {
  const db = await getDb();
  const cart = await getOrCreateCart(opts);
  const [item] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, opts.itemId), eq(cartItems.cartId, cart.id)))
    .limit(1);
  if (item) {
    const stock = await availableStock(db, item.variantId);
    await db
      .update(cartItems)
      .set({ quantity: Math.min(opts.quantity, Math.max(stock, 1)), updatedAt: new Date() })
      .where(eq(cartItems.id, item.id));
  }
  return mapCart(db, cart.id);
}

export async function removeCartItem(opts: {
  sessionId: string;
  userId: string | null;
  itemId: string;
}): Promise<PersistedCart> {
  const db = await getDb();
  const cart = await getOrCreateCart(opts);
  await db.delete(cartItems).where(and(eq(cartItems.id, opts.itemId), eq(cartItems.cartId, cart.id)));
  return mapCart(db, cart.id);
}

export async function setDiscountCode(opts: {
  sessionId: string;
  userId: string | null;
  code: string | null;
}): Promise<PersistedCart> {
  const db = await getDb();
  const cart = await getOrCreateCart(opts);
  await db
    .update(carts)
    .set({ appliedDiscountCode: opts.code, updatedAt: new Date() })
    .where(eq(carts.id, cart.id));
  return mapCart(db, cart.id);
}

export async function mergeGuestCart(opts: {
  sessionId: string;
  userId: string | null;
  anonymousSessionId?: string;
}): Promise<PersistedCart> {
  const db = await getDb();
  const target = await getOrCreateCart(opts);
  const guestKey = opts.anonymousSessionId;
  if (!guestKey || guestKey === opts.sessionId) {
    return target;
  }
  const guest = await db.query.carts.findFirst({
    where: eq(carts.anonymousSessionId, guestKey),
  });
  if (!guest || guest.id === target.id) {
    return target;
  }
  await mergeCartRows(db, guest.id, target.id);
  await db.delete(carts).where(eq(carts.id, guest.id));
  return mapCart(db, target.id);
}

export async function clearCart(opts: { sessionId: string; userId: string | null }): Promise<PersistedCart> {
  const db = await getDb();
  const cart = await getOrCreateCart(opts);
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  await db
    .update(carts)
    .set({ appliedDiscountCode: null, updatedAt: new Date() })
    .where(eq(carts.id, cart.id));
  return mapCart(db, cart.id);
}
