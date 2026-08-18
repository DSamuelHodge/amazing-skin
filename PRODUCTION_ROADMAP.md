# Lumina Skin Rituals — Production Readiness Specification & Architecture Blueprint

This document provides a comprehensive technical audit of the current prototype and establishes the complete engineering blueprint to transition **Lumina Skin Rituals** into an enterprise-grade, high-performance, and scalable e-commerce platform.

---

## Table of Contents
1. [Codebase Audit & Gap Analysis](#1-codebase-audit--gap-analysis)
2. [Design Token System (Tailwind v4 & CSS Variables)](#2-design-token-system)
3. [Production Drizzle ORM Schema (PostgreSQL & TypeScript)](#3-production-drizzle-orm-schema)
4. [Backend Architecture & API Specification](#4-backend-architecture--api-specification)
5. [Authentication, Sessions & Cart Reconciliation](#5-authentication-sessions--cart-reconciliation)
6. [Stripe Payment Engine & Webhook Architecture](#6-stripe-payment-engine--webhook-architecture)
7. [Admin Dashboard & Customer Portal Architecture](#7-admin-dashboard--customer-portal-architecture)
8. [Security, Performance & Compliance Checklist](#8-security-performance--compliance-checklist)
9. [Step-by-Step Implementation Roadmap](#9-step-by-step-implementation-roadmap)

---

## 1. Codebase Audit & Gap Analysis

### 1.1 Current State Overview
The current repository is an interactive client-side prototype built with React 19, Vite, Tailwind CSS v4, `@base-ui/react` / `shadcn/ui`, and a mocked client-side tRPC layer using Zustand.

### 1.2 Gap Analysis Matrix

| Feature Domain | Current Prototype State | Production Requirement | Severity |
| :--- | :--- | :--- | :--- |
| **Data Persistence** | In-memory `mockData.ts` & local React state | PostgreSQL relational database managed by Drizzle ORM with connection pooling | **Critical** |
| **API Layer** | Mocked client-side tRPC in `src/lib/trpc.ts` | Real Node.js / Express backend with tRPC v11 or type-safe REST endpoints | **Critical** |
| **Authentication** | Simulated modal storing `guestCartId` | Session-based / JWT authentication (Auth.js / Supabase / Clerk) with role-based access (RBAC) | **Critical** |
| **Cart & Guest Checkout** | Client state in Zustand + local storage | Server-authoritative carts with optimistic locking and guest-to-customer reconciliation | **High** |
| **Payment Processing** | Visual placeholder in checkout Step 3 | Full Stripe Payment Element, webhooks, idempotency keys, and refund processing | **Critical** |
| **Inventory Management** | Static numbers in mock variants | Atomic stock reservations with checkout timeouts and warehouse inventory logs | **Critical** |
| **Design Tokens** | Hardcoded hex values (`#1b2320`, `#f4eadf`) and mixed classes | Centralized OKLCH / HSL token system in CSS variables and Tailwind theme aliases | **Medium** |
| **Admin Operations** | None | Secure multi-tenant admin dashboard for products, orders, customers, and analytics | **High** |
| **Content Management** | Hardcoded strings and image URLs | CMS-driven / database-backed banners, routines, FAQ, and clinical claims | **Medium** |

---

## 2. Design Token System

To eliminate arbitrary hardcoded color values and create cohesive visual hierarchy across both the customer-facing storefront and admin dashboard, the design system utilizes OKLCH-based color spaces with calibrated light and dark palettes.

### 2.1 Color Token Taxonomy

```
Palette Archetype: Organic Luxury & Botanical Calm
- Primary Brand: Deep Forest Emerald (Grounding, natural authority)
- Secondary Accent: Healing Jade / Sage (Active botanical energy)
- Warm Surface Neutral: Alabaster Cream (Light luxury canvas)
- Deep Surface Neutral: Night Forest (Dark luxury canvas)
- Functional: Coral (Destructive/Warning), Amber (Pending), Emerald (Success), Indigo (Admin Action)
```

#### Token Values & Semantic Mapping

| Token Name | Light Mode (OKLCH / CSS) | Dark Mode (OKLCH / CSS) | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| `--color-canvas-bg` | `oklch(0.96 0.015 85)` (`#f5ede4`) | `oklch(0.18 0.025 155)` (`#16201b`) | Page primary background |
| `--color-canvas-surface` | `oklch(0.99 0.005 85)` (`#faf7f3`) | `oklch(0.22 0.030 155)` (`#1d2a23`) | Card, modal & drawer background |
| `--color-canvas-elevated` | `oklch(1.00 0.000 0)` (`#ffffff`) | `oklch(0.26 0.035 155)` (`#24352c`) | Tooltip, popover, dropdown background |
| `--color-brand-primary` | `oklch(0.25 0.045 155)` (`#15281e`) | `oklch(0.78 0.120 155)` (`#6ee7b7`) | Key CTAs, brand highlights, active states |
| `--color-brand-accent` | `oklch(0.72 0.110 155)` (`#34d399`) | `oklch(0.85 0.130 155)` (`#a7f3d0`) | Badges, discount tags, icons |
| `--color-text-primary` | `oklch(0.20 0.020 60)` (`#1c1917`) | `oklch(0.96 0.010 85)` (`#f4f1ea`) | Headings, primary copy |
| `--color-text-muted` | `oklch(0.50 0.020 60)` (`#78716c`) | `oklch(0.70 0.025 155)` (`#a3b8ad`) | Subtitles, helper text, timestamps |
| `--color-border-subtle` | `oklch(0.88 0.015 85)` (`#e7ded3`) | `oklch(0.30 0.030 155)` (`#2c3e34`) | Card borders, dividers |
| `--color-border-strong` | `oklch(0.75 0.020 85)` (`#c7bcad`) | `oklch(0.42 0.045 155)` (`#3f584b`) | Interactive inputs, active tab borders |

---

### 2.2 Typography Scale & Mathematical Ratios

- **Heading Font Family**: `Playfair Display`, serif (Editorial, clinical authority, luxury)
- **Body Font Family**: `Geist Variable` / `Inter`, sans-serif (High legibility, optical micro-contrast)
- **Scale Step Ratio**: Major Second (1.125) for dense UI components; Perfect Fourth (1.333) for editorial headings.

```css
/* Typography Scale */
--text-2xs: 0.6875rem; /* 11px - line-height: 1.0rem */
--text-xs:  0.75rem;   /* 12px - line-height: 1.1rem */
--text-sm:  0.875rem;  /* 14px - line-height: 1.35rem */
--text-base: 1.000rem; /* 16px - line-height: 1.6rem (Baseline) */
--text-lg:  1.125rem;  /* 18px - line-height: 1.65rem */
--text-xl:  1.333rem;  /* 21.3px - line-height: 1.8rem */
--text-2xl: 1.777rem;  /* 28.4px - line-height: 2.2rem */
--text-3xl: 2.369rem;  /* 37.9px - line-height: 2.7rem */
--text-4xl: 3.157rem;  /* 50.5px - line-height: 3.4rem */
--text-5xl: 4.209rem;  /* 67.3px - line-height: 4.5rem */
```

---

### 2.3 Spacing, Radius & Elevation Tokens

```css
/* Spatial Grid (4px base) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.50rem;  /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1.00rem;  /* 16px - standard container inner padding */
--space-6: 1.50rem;  /* 24px - card padding */
--space-8: 2.00rem;  /* 32px - section gap */
--space-12: 3.00rem; /* 48px - block separation */
--space-16: 4.00rem; /* 64px - hero padding */
--space-24: 6.00rem; /* 96px - major layout margins */

/* Radii with Geometric Nesting: Inner = Outer - Padding */
--radius-sm: 0.375rem; /* 6px - inner buttons, tags */
--radius-md: 0.500rem; /* 8px - form inputs, dropdowns */
--radius-lg: 0.750rem; /* 12px - cards, modals */
--radius-xl: 1.000rem; /* 16px - primary product cards */
--radius-full: 9999px; /* pills, circular actions */
```

---

## 3. Production Drizzle ORM Schema

The following complete TypeScript schema defines the database structure for **Catalog/Site**, **Customer Portal**, **Cart/Checkout**, **Orders/Fulfillment**, and **Admin Dashboard/Auditing**.

```typescript
// src/db/schema.ts
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  uuid,
  pgEnum,
  index,
  uniqueIndex,
  primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==========================================
// 1. ENUMS
// ==========================================

export const userRoleEnum = pgEnum('user_role', ['customer', 'support', 'manager', 'admin', 'super_admin']);
export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment',
  'payment_failed',
  'processing',
  'partially_fulfilled',
  'fulfilled',
  'cancelled',
  'refunded'
]);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'authorized', 'captured', 'failed', 'refunded']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed_amount', 'free_shipping', 'gwp']);
export const skinTypeEnum = pgEnum('skin_type', ['dry', 'oily', 'combination', 'sensitive', 'normal']);
export const inventoryActionEnum = pgEnum('inventory_action', ['restock', 'order_reservation', 'order_fulfilled', 'adjustment', 'return_restock']);
export const fulfillmentStatusEnum = pgEnum('fulfillment_status', ['unfulfilled', 'packing', 'shipped', 'in_transit', 'delivered', 'failed']);

// ==========================================
// 2. AUTH & USER ROLES (RBAC)
// ==========================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').default('customer').notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_stripe_cust_idx').on(table.stripeCustomerId)
]);

export const customerProfiles = pgTable('customer_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 30 }),
  loyaltyPoints: integer('loyalty_points').default(0).notNull(),
  loyaltyTier: varchar('loyalty_tier', { length: 50 }).default('Bronze').notNull(),
  primarySkinType: skinTypeEnum('primary_skin_type'),
  skinConcerns: jsonb('skin_concerns').$type<string[]>().default([]),
  preferences: jsonb('preferences').$type<{
    acceptsMarketingEmail: boolean;
    acceptsSmsNotifications: boolean;
    preferredRoutineTime: 'morning' | 'evening' | 'both';
  }>().default({
    acceptsMarketingEmail: false,
    acceptsSmsNotifications: false,
    preferredRoutineTime: 'both',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const customerAddresses = pgTable('customer_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isDefaultShipping: boolean('is_default_shipping').default(false).notNull(),
  isDefaultBilling: boolean('is_default_billing').default(false).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  company: varchar('company', { length: 100 }),
  addressLine1: varchar('address_line1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 30 }).notNull(),
  country: varchar('country', { length: 2 }).default('US').notNull(),
  phone: varchar('phone', { length: 30 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const customerWishlists = pgTable('customer_wishlists', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('wishlist_user_product_unique').on(table.userId, table.productId)
]);

// ==========================================
// 3. CATALOG & PRODUCT SCHEMA
// ==========================================

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  parentCategoryId: uuid('parent_category_id'),
  displayOrder: integer('display_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  shortDescription: text('short_description').notNull(),
  description: text('description').notNull(),
  proTip: text('pro_tip'),
  categoryId: uuid('category_id').references(() => categories.id).notNull(),
  formulationType: varchar('formulation_type', { length: 100 }).notNull(),
  basePrice: numeric('base_price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric('compare_at_price', { precision: 10, scale: 2 }),
  costPerItem: numeric('cost_per_item', { precision: 10, scale: 2 }),
  applicationInstructions: jsonb('application_instructions').$type<string[]>().default([]).notNull(),
  warnings: jsonb('warnings').$type<string[]>().default([]).notNull(),
  contraindications: jsonb('contraindications').$type<string[]>().default([]).notNull(),
  pregnancySafe: boolean('pregnancy_safe').default(true).notNull(),
  routineStep: integer('routine_step').default(1).notNull(),
  timeOfDay: varchar('time_of_day', { length: 50 }).default('both').notNull(),
  shelfLifeMonths: integer('shelf_life_months').default(24).notNull(),
  periodAfterOpeningMonths: integer('pao_months').default(12).notNull(),
  storageInstructions: text('storage_instructions'),
  isVegan: boolean('is_vegan').default(true).notNull(),
  isCrueltyFree: boolean('is_cruelty_free').default(true).notNull(),
  isFragranceFree: boolean('is_fragrance_free').default(true).notNull(),
  isReefSafe: boolean('is_reef_safe').default(true).notNull(),
  isOrganic: boolean('is_organic').default(false).notNull(),
  isGlutenFree: boolean('is_gluten_free').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isBestSeller: boolean('is_best_seller').default(false).notNull(),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('products_slug_idx').on(table.slug),
  index('products_category_idx').on(table.categoryId)
]);

export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  barcode: varchar('barcode', { length: 100 }),
  name: varchar('name', { length: 100 }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric('compare_at_price', { precision: 10, scale: 2 }),
  stockQuantity: integer('stock_quantity').default(0).notNull(),
  reservedQuantity: integer('reserved_quantity').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(10).notNull(),
  weightGrams: integer('weight_grams').default(100),
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('variants_product_id_idx').on(table.productId),
  index('variants_sku_idx').on(table.sku)
]);

export const variantAttributes = pgTable('variant_attributes', {
  id: uuid('id').defaultRandom().primaryKey(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
  attributeType: varchar('attribute_type', { length: 50 }).notNull(), // 'size', 'refill_type', 'shade'
  value: varchar('value', { length: 100 }).notNull(),
  hexCode: varchar('hex_code', { length: 20 }),
});

export const productImages = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  imageUrl: text('image_url').notNull(),
  altText: varchar('alt_text', { length: 255 }).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
});

export const ingredients = pgTable('ingredients', {
  id: uuid('id').defaultRandom().primaryKey(),
  inciName: varchar('inci_name', { length: 255 }).notNull().unique(),
  commonName: varchar('common_name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  ewgScore: integer('ewg_score').default(1).notNull(),
  isKeyIngredient: boolean('is_key_ingredient').default(false).notNull(),
  isFragrance: boolean('is_fragrance').default(false).notNull(),
  isComedogenic: boolean('is_comedogenic').default(false).notNull(),
});

export const productIngredients = pgTable('product_ingredients', {
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  ingredientId: uuid('ingredient_id').references(() => ingredients.id, { onDelete: 'cascade' }).notNull(),
  concentration: varchar('concentration', { length: 50 }),
  displayOrder: integer('display_order').default(0).notNull(),
}, (table) => [
  primaryKey({ columns: [table.productId, table.ingredientId] })
]);

export const relatedProducts = pgTable('related_products', {
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  relatedProductId: uuid('related_product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  relationshipType: varchar('relationship_type', { length: 50 }).default('pair_with').notNull(), // 'pair_with', 'upsell', 'cross_sell'
  displayOrder: integer('display_order').default(0).notNull(),
}, (table) => [
  primaryKey({ columns: [table.productId, table.relatedProductId] })
]);

export const productReviews = pgTable('product_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  reviewerName: varchar('reviewer_name', { length: 100 }).notNull(),
  rating: integer('rating').notNull(),
  headline: varchar('headline', { length: 255 }),
  comment: text('comment').notNull(),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
  isApproved: boolean('is_approved').default(false).notNull(),
  skinTypeReported: skinTypeEnum('skin_type_reported'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('reviews_product_idx').on(table.productId),
  index('reviews_rating_idx').on(table.rating)
]);

// ==========================================
// 4. CART & PROMOTIONS
// ==========================================

export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  anonymousSessionId: varchar('anonymous_session_id', { length: 255 }),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  appliedDiscountCode: varchar('applied_discount_code', { length: 50 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('cart_user_idx').on(table.userId),
  index('cart_session_idx').on(table.anonymousSessionId)
]);

export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  isFreeGift: boolean('is_free_gift').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('cart_variant_unique').on(table.cartId, table.variantId)
]);

export const discountCodes = pgTable('discount_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  discountType: discountTypeEnum('discount_type').notNull(),
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(), // percentage or fixed $
  minSubtotal: numeric('min_subtotal', { precision: 10, scale: 2 }).default('0.00'),
  usageLimitTotal: integer('usage_limit_total'),
  usageCount: integer('usage_count').default(0).notNull(),
  usageLimitPerCustomer: integer('usage_limit_per_customer').default(1),
  gwpVariantId: uuid('gwp_variant_id').references(() => productVariants.id),
  startsAt: timestamp('starts_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
});

// ==========================================
// 5. ORDERS & CHECKOUT
// ==========================================

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  email: varchar('email', { length: 255 }).notNull(),
  orderStatus: orderStatusEnum('order_status').default('pending_payment').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
  fulfillmentStatus: fulfillmentStatusEnum('fulfillment_status').default('unfulfilled').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  discountTotal: numeric('discount_total', { precision: 10, scale: 2 }).default('0.00').notNull(),
  shippingTotal: numeric('shipping_total', { precision: 10, scale: 2 }).default('0.00').notNull(),
  taxTotal: numeric('tax_total', { precision: 10, scale: 2 }).default('0.00').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  loyaltyPointsEarned: integer('loyalty_points_earned').default(0).notNull(),
  loyaltyPointsRedeemed: integer('loyalty_points_redeemed').default(0).notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('orders_number_idx').on(table.orderNumber),
  index('orders_user_idx').on(table.userId),
  index('orders_status_idx').on(table.orderStatus)
]);

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  variantName: varchar('variant_name', { length: 100 }).notNull(),
  sku: varchar('sku', { length: 100 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  lineTotal: numeric('line_total', { precision: 10, scale: 2 }).notNull(),
  isFreeGift: boolean('is_free_gift').default(false).notNull(),
});

export const orderAddresses = pgTable('order_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'shipping' | 'billing'
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  company: varchar('company', { length: 100 }),
  addressLine1: varchar('address_line1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 30 }).notNull(),
  country: varchar('country', { length: 2 }).notNull(),
  phone: varchar('phone', { length: 30 }),
});

export const orderFulfillments = pgTable('order_fulfillments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  trackingCarrier: varchar('tracking_carrier', { length: 100 }), // 'USPS', 'FedEx', 'DHL'
  trackingNumber: varchar('tracking_number', { length: 255 }),
  trackingUrl: text('tracking_url'),
  status: fulfillmentStatusEnum('status').default('unfulfilled').notNull(),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// 6. ADMIN, AUDITING & OPERATIONS
// ==========================================

export const inventoryLogs = pgTable('inventory_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  variantId: uuid('variant_id').references(() => productVariants.id).notNull(),
  action: inventoryActionEnum('action').notNull(),
  quantityChange: integer('quantity_change').notNull(),
  resultingStock: integer('resulting_stock').notNull(),
  referenceId: varchar('reference_id', { length: 100 }), // Order ID or adjustment ticket
  adminUserId: uuid('admin_user_id').references(() => users.id),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminUserId: uuid('admin_user_id').references(() => users.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(), // 'product.update', 'order.refund', 'coupon.create'
  targetEntity: varchar('target_entity', { length: 100 }).notNull(),
  targetId: varchar('target_id', { length: 100 }).notNull(),
  changes: jsonb('changes').$type<{ before: any; after: any }>(),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cmsContentBlocks = pgTable('cms_content_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(), // 'home_hero', 'evening_ritual_section'
  title: varchar('title', { length: 255 }).notNull(),
  payload: jsonb('payload').notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// 7. DRIZZLE RELATIONS DEFINITION
// ==========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(customerProfiles, {
    fields: [users.id],
    references: [customerProfiles.userId],
  }),
  addresses: many(customerAddresses),
  orders: many(orders),
  wishlists: many(customerWishlists),
  reviews: many(productReviews),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
  ingredients: many(productIngredients),
  relatedProducts: many(relatedProducts),
  reviews: many(productReviews),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  attributes: many(variantAttributes),
  images: many(productImages),
  inventoryLogs: many(inventoryLogs),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  addresses: many(orderAddresses),
  fulfillments: many(orderFulfillments),
}));
```

---

## 4. Backend Architecture & API Specification

### 4.1 Production Technology Stack
- **Server Framework**: Node.js + Express with native TypeScript compilation.
- **RPC & Validation**: `@trpc/server` v11 with Zod v4 validation.
- **ORM & Migrations**: Drizzle ORM (`drizzle-orm` + `drizzle-kit`) connecting via `postgres` (or `@neondatabase/serverless` / `pg`).
- **Payment Processing**: `stripe` Node SDK with verified webhook signing.
- **Cache & Rate Limiting**: Redis / Upstash for session caches and IP rate-limiting.

### 4.2 tRPC Router Hierarchy

```
appRouter
├── auth
│   ├── signUp (email, password, profile)
│   ├── signIn (email, password)
│   ├── signOut ()
│   ├── getCurrentUser ()
│   └── refreshToken ()
├── catalog
│   ├── getCategories ()
│   ├── getProducts ({ categorySlug?, search?, limit, cursor })
│   ├── getProductBySlug ({ slug })
│   ├── getFeaturedRitual ()
│   └── getRelatedProducts ({ productId })
├── cart
│   ├── get ()
│   ├── addItem ({ variantId, quantity })
│   ├── updateItem ({ itemId, quantity })
│   ├── removeItem ({ itemId })
│   ├── applyDiscountCode ({ code })
│   ├── removeDiscountCode ()
│   └── mergeGuestCart ({ anonymousSessionId })
├── checkout
│   ├── calculateSummary ({ shippingAddress, discountCode })
│   ├── createPaymentIntent ({ shippingAddress, billingAddress, discountCode })
│   └── confirmOrder ({ stripePaymentIntentId })
├── customer
│   ├── getProfile ()
│   ├── updateProfile ({ firstName, lastName, skinProfile })
│   ├── getAddresses ()
│   ├── saveAddress ({ address })
│   ├── getOrderHistory ({ page, limit })
│   ├── getOrderDetails ({ orderId })
│   └── toggleWishlist ({ productId })
└── admin (Protected: RBAC >= 'support' | 'manager' | 'admin')
    ├── metrics.getDashboardStats ({ timeRange })
    ├── products.list ({ page, limit, filter })
    ├── products.create ({ productData })
    ├── products.update ({ id, productData })
    ├── orders.list ({ status, page, limit })
    ├── orders.updateStatus ({ orderId, status, trackingInfo })
    ├── inventory.adjust ({ variantId, adjustment, reason })
    └── discounts.manage ({ action, payload })
```

---

## 5. Authentication, Sessions & Cart Reconciliation

### 5.1 Anonymous Session Lifecycle
1. When a visitor lands without credentials, the client checks `localStorage` or HttpOnly cookie for `lumina_session_id`.
2. If absent, a cryptographically random UUID is minted and registered in the database `carts` table with a 30-day expiration (`expires_at`).
3. All cart operations (`addItem`, `removeItem`) link to this session ID.

### 5.2 Guest-to-Customer Cart Merging Protocol
When the user signs in or completes account registration:
```
[User Signs In / Signs Up]
       │
       ▼
[Server checks if User already has an Active Cart]
  ├── YES:
  │    ├── Look up Items in Anonymous Session Cart
  │    ├── Upsert into User Cart:
  │    │     - If variant exists: quantity = min(user_qty + guest_qty, variant_max_stock)
  │    │     - If variant does not exist: insert new cart_item
  │    └── Delete Anonymous Session Cart
  └── NO:
       └── Reassign `cart.userId = authenticatedUser.id`, clear `anonymousSessionId`
```

---

## 6. Stripe Payment Engine & Webhook Architecture

### 6.1 Two-Phase Inventory Reservation & Checkout Flow

```
1. Customer clicks "Place Order" / enters Step 3
2. Server validates price calculation & checks variant stock
3. Server executes atomic stock lock:
   UPDATE product_variants 
   SET reserved_quantity = reserved_quantity + :qty 
   WHERE id = :variantId AND (stock_quantity - reserved_quantity) >= :qty;
4. Server creates Stripe PaymentIntent with metadata:
   { cartId, userId, orderNumber, expiresAt: Date.now() + 15 * 60 * 1000 }
5. Client mounts Stripe Payment Element and collects payment
6. Webhook `payment_intent.succeeded` triggers:
   ├── Transition orderStatus -> 'processing'
   ├── Transition paymentStatus -> 'captured'
   ├── Deduct stock_quantity = stock_quantity - reserved_quantity
   ├── Release reserved_quantity = reserved_quantity - reserved_quantity
   ├── Insert into `inventory_logs` (action: 'order_fulfilled')
   ├── Credit customer `loyalty_points`
   └── Dispatch Order Confirmation Email via Resend / SendGrid
```

### 6.2 Idempotent Webhook Handler Implementation Blueprint
```typescript
// server/webhooks/stripe.ts
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '@/src/db';
import { orders, inventoryLogs, productVariants } from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Signature Error: ${err.message}`);
  }

  // Idempotency check: verify if event was already handled
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    await db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for('update');
      
      if (!order || order.paymentStatus === 'captured') {
        return; // Already processed
      }

      await tx.update(orders).set({
        paymentStatus: 'captured',
        orderStatus: 'processing',
        updatedAt: new Date()
      }).where(eq(orders.id, orderId));
    });
  }

  res.json({ received: true });
}
```

---

## 7. Admin Dashboard & Customer Portal Architecture

### 7.1 Admin Operations Portal (Route: `/admin/*`)
- **Dashboard Overview**: Real-time GMV, Average Order Value (AOV), Conversion Rate, Return on Ad Spend (ROAS), Low Stock Alerts.
- **Product & Variant Catalog**:
  - Live ingredient builder with EWG score validation.
  - Multi-variant matrix (size, refill options) with SKU generation and image gallery ordering.
- **Order Management & Fulfillment**:
  - Order status pipelines: Pending Payment → Processing → Packing → Shipped → Delivered.
  - One-click USPS/FedEx shipping label generation and tracking number notifications.
  - Return / Refund processing with stock write-back options.
- **Promotions Engine**:
  - Tiered threshold discounts (e.g., "$10 off over $80").
  - Automated Gift-With-Purchase (GWP) rules triggered at cart checkout.
  - Custom influencer single-use coupon generator.
- **Audit & Inventory Ledger**: Real-time audit logs capturing all admin record modifications with IP and timestamp.

### 7.2 Customer Self-Service Portal (Route: `/account/*`)
- **Order History & Real-Time Tracking**: Direct carrier tracking integration.
- **Lumina Skin Profile**: Interactive skin quiz results, product suitability warnings, morning/evening routine checklists.
- **Refill Subscription Manager**: Pause, skip, or modify frequency of glass bottle refills.
- **Loyalty & Rewards**: Points ledger with milestone discounts.

---

## 8. Security, Performance & Compliance Checklist

### 8.1 Security & Data Integrity
- [ ] **Strict Role-Based Access Control (RBAC)**: Protect admin routes with server-side middleware checking session roles (`admin`, `super_admin`).
- [ ] **SQL Injection Prevention**: 100% parameterized queries via Drizzle ORM.
- [ ] **Rate Limiting & DoS Protection**: Express `express-rate-limit` on `/api/auth/*`, `/api/trpc/cart.addItem`, and checkout endpoints.
- [ ] **Content Security Policy & Headers**: Helmet.js enabled with strict CSP for external Stripe iframes and image CDNs.
- [ ] **Sanitization**: Strip malicious scripts using Zod schema transforms and DOMPurify for user reviews.

### 8.2 Performance & Core Web Vitals (CWV)
- [ ] **Target LCP < 1.8s**: Hero images served in AVIF/WebP with responsive `srcset` and `fetchpriority="high"`.
- [ ] **Target CLS < 0.05**: Explicit `aspect-ratio` defined on all image containers.
- [ ] **Bundle Budget**: Chunk splitting in Vite; lazily load checkout and admin routes using React `Suspense` and `lazy()`.

### 8.3 Accessibility (WCAG 2.1 AA)
- [ ] Ensure all interactive buttons have a minimum touch target size of 44x44px.
- [ ] Maintain color contrast ratio $\ge 4.5:1$ for all body text and $\ge 3:1$ for large display titles.
- [ ] Full keyboard navigation support (focus rings via `focus-visible`, trap focus in Cart Drawer and Sign-In Modals).

---

## 9. Step-by-Step Implementation Roadmap

```
PHASE 1: Database & Foundation (Week 1-2)
  ├── Provision PostgreSQL instance (Cloud SQL / Neon / Supabase)
  ├── Initialize Drizzle ORM, apply migrations for schema.ts
  ├── Seed catalog data (products, variants, ingredients, rituals)
  └── Configure design tokens in index.css

PHASE 2: Backend tRPC & Auth (Week 3-4)
  ├── Set up Express + Vite server with tRPC v11 routers
  ├── Implement Authentication & RBAC middleware
  ├── Connect Cart Router with anonymous session tracking & merging
  └── Connect Catalog Routers with database queries

PHASE 3: Stripe Integration & Checkout (Week 5)
  ├── Mount Stripe Elements in Checkout Step 3
  ├── Implement Stripe Webhook handler with atomic stock reservations
  └── Build Order Confirmation & email notification dispatchers

PHASE 4: Admin Dashboard & Customer Portal (Week 6-7)
  ├── Implement Admin Metrics, Order Processing & Catalog CRUD
  ├── Implement Customer Order History & Skin Profile manager
  └── Implement Promotions & Gift-With-Purchase engine

PHASE 5: QA, Hardening & Production Deployment (Week 8)
  ├── End-to-end checkout & payment testing
  ├── WCAG AA accessibility & Lighthouse audits (Performance > 90)
  └── Containerized deployment to Cloud Run with automated CI/CD
```
