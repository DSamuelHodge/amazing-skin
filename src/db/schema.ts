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
  primaryKey,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// ==========================================
// 1. DATABASE ENUMS
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

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'authorized',
  'captured',
  'failed',
  'refunded'
]);

export const discountTypeEnum = pgEnum('discount_type', [
  'percentage',
  'fixed_amount',
  'free_shipping',
  'gwp'
]);

export const skinTypeEnum = pgEnum('skin_type', [
  'dry',
  'oily',
  'combination',
  'sensitive',
  'normal'
]);

export const inventoryActionEnum = pgEnum('inventory_action', [
  'restock',
  'order_reservation',
  'order_fulfilled',
  'adjustment',
  'return_restock'
]);

export const fulfillmentStatusEnum = pgEnum('fulfillment_status', [
  'unfulfilled',
  'packing',
  'shipped',
  'in_transit',
  'delivered',
  'failed'
]);

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
  attributeType: varchar('attribute_type', { length: 50 }).notNull(),
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
  relationshipType: varchar('relationship_type', { length: 50 }).default('pair_with').notNull(),
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
  index('reviews_rating_idx').on(table.rating),
  check('rating_range', sql`rating between 1 and 5`),
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
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
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
  type: varchar('type', { length: 20 }).notNull(),
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
  trackingCarrier: varchar('tracking_carrier', { length: 100 }),
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
  referenceId: varchar('reference_id', { length: 100 }),
  adminUserId: uuid('admin_user_id').references(() => users.id),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminUserId: uuid('admin_user_id').references(() => users.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  targetEntity: varchar('target_entity', { length: 100 }).notNull(),
  targetId: varchar('target_id', { length: 100 }).notNull(),
  changes: jsonb('changes').$type<{ before: any; after: any }>(),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cmsContentBlocks = pgTable('cms_content_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  payload: jsonb('payload').notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// 7. DRIZZLE RELATIONS DEFINITIONS
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

export const customerProfilesRelations = relations(customerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [customerProfiles.userId],
    references: [users.id],
  }),
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

// ==========================================
// 8. ZOD SCHEMA GENERATION & INFERRED TYPES
// ==========================================

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export type DbProduct = typeof products.$inferSelect;
export type NewDbProduct = typeof products.$inferInsert;

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);
export type DbOrder = typeof orders.$inferSelect;
export type NewDbOrder = typeof orders.$inferInsert;

export const insertCartSchema = createInsertSchema(carts);
export const selectCartSchema = createSelectSchema(carts);
export type DbCart = typeof carts.$inferSelect;
export type NewDbCart = typeof carts.$inferInsert;
