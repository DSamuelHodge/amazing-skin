import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, gt, ilike, inArray, or, sql } from 'drizzle-orm';
import { mockData } from '@/src/data/mockData';
import type { Product, RelatedProduct } from '@/src/types';
import { getDb } from '../../../src/db/client';
import {
  categories,
  ingredients,
  productImages,
  productIngredients,
  productReviews,
  productVariants,
  products,
  relatedProducts,
  variantAttributes,
} from '../../../src/db/schema';
import { createTRPCRouter, publicProcedure } from '../init';

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parsePrice(price: string) {
  return Number(String(price).replace(/[^0-9.]/g, '')) || 0;
}

function money(value: string | number | null | undefined): number {
  if (value == null) return 0;
  return Number(value);
}

type ShopCard = (typeof mockData.shop.newArrivals)[number] | (typeof mockData.shop.topProducts)[number];

function shopCards(): ShopCard[] {
  return [...mockData.shop.newArrivals, ...mockData.shop.topProducts];
}

function shopToProduct(item: ShopCard): Product {
  const slug = slugify(item.title);
  const price = parsePrice(item.price);
  const tag = item.tag.toLowerCase();
  return {
    id: `prod_${slug}`,
    name: item.title,
    slug,
    description: `<p>${item.description}</p>`,
    shortDescription: item.description,
    primaryCategory: 'face',
    formulationType: 'skincare',
    basePrice: price,
    compareAtPrice: null,
    applicationInstructions: [],
    warnings: [],
    contraindications: [],
    pregnancySafe: true,
    routineStep: 1,
    timeOfDay: 'both',
    shelfLifeMonths: 24,
    periodAfterOpeningMonths: 12,
    storageInstructions: 'Store in a cool, dry place away from direct sunlight.',
    isVegan: true,
    isCrueltyFree: true,
    isFragranceFree: true,
    isReefSafe: false,
    isOrganic: false,
    isNatural: true,
    isGlutenFree: true,
    isActive: true,
    isFeatured: tag.includes('best'),
    isNewArrival: tag.includes('new') || tag.includes('just') || tag.includes('limited'),
    isBestSeller: tag.includes('best') || tag.includes('loved'),
    variants: [
      {
        id: `var_${slug}`,
        sku: slug.replace(/-/g, '').slice(0, 12).toUpperCase(),
        name: item.size ?? 'Default',
        price,
        compareAtPrice: null,
        stockQuantity: 20,
        isActive: true,
        displayOrder: 1,
        attributes: item.size ? [{ attributeType: 'size', value: item.size }] : [],
        images: [],
      },
    ],
    images: [
      {
        id: `img_${slug}`,
        imageUrl: item.image,
        altText: item.title,
        isPrimary: true,
        displayOrder: 1,
      },
    ],
    averageRating: 'rating' in item ? item.rating : 4.8,
    reviewCount:
      'reviews' in item ? Number(String(item.reviews).replace(/[^0-9]/g, '')) || 0 : 0,
    reviews: [],
    ingredients: [],
    relatedProducts: [],
  };
}

/** Sync mock fallback used by the in-memory cart until P2-04 lands. */
export function findVariantMeta(variantId: string) {
  const featured = mockData.productDetails;
  const featuredVariant = featured.variants.find((v) => v.id === variantId);
  if (featuredVariant) {
    const image =
      featuredVariant.images[0] ??
      featured.images.find((img) => img.isPrimary) ??
      featured.images[0];
    return {
      variantId: featuredVariant.id,
      unitPrice: featuredVariant.price,
      product: {
        name: featured.name,
        slug: featured.slug,
        primaryCategory: featured.primaryCategory,
      },
      variant: {
        name: featuredVariant.name,
        sku: featuredVariant.sku,
        attributes: featuredVariant.attributes,
      },
      image: { imageUrl: image?.imageUrl ?? '' },
    };
  }

  for (const card of shopCards()) {
    const product = shopToProduct(card);
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) {
      return {
        variantId: variant.id,
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
        image: { imageUrl: product.images[0]?.imageUrl ?? '' },
      };
    }
  }

  return null;
}

export async function resolveVariantMeta(variantId: string) {
  const db = await getDb();
  const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    variantId,
  );

  let variant = uuidLike
    ? await db.query.productVariants.findFirst({
        where: eq(productVariants.id, variantId),
      })
    : undefined;

  if (!variant) {
    const slug = variantId.startsWith('var_') ? variantId.slice(4) : variantId;
    const product = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
    if (product) {
      const rows = await db
        .select()
        .from(productVariants)
        .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
        .orderBy(asc(productVariants.displayOrder))
        .limit(1);
      variant = rows[0];
    }
  }

  if (!variant) {
    return findVariantMeta(variantId);
  }

  const product = await db.query.products.findFirst({
    where: eq(products.id, variant.productId),
  });
  const category = product
    ? await db.query.categories.findFirst({ where: eq(categories.id, product.categoryId) })
    : undefined;
  const attrs = await db
    .select()
    .from(variantAttributes)
    .where(eq(variantAttributes.variantId, variant.id));
  const [image] =
    (await db
      .select()
      .from(productImages)
      .where(
        or(eq(productImages.variantId, variant.id), eq(productImages.productId, variant.productId)),
      )
      .orderBy(desc(productImages.isPrimary), asc(productImages.displayOrder))
      .limit(1)) ?? [];

  return {
    variantId: variant.id,
    unitPrice: money(variant.price),
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

type DbProduct = typeof products.$inferSelect;

async function hydrateProduct(row: DbProduct): Promise<Product> {
  const db = await getDb();
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, row.categoryId),
  });
  const variantRows = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.productId, row.id), eq(productVariants.isActive, true)))
    .orderBy(asc(productVariants.displayOrder));
  const imageRows = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, row.id))
    .orderBy(desc(productImages.isPrimary), asc(productImages.displayOrder));
  const reviewRows = await db
    .select()
    .from(productReviews)
    .where(and(eq(productReviews.productId, row.id), eq(productReviews.isApproved, true)))
    .orderBy(desc(productReviews.createdAt));

  const ingredientRows = await db
    .select({
      id: ingredients.id,
      inciName: ingredients.inciName,
      commonName: ingredients.commonName,
      description: ingredients.description,
      displayOrder: productIngredients.displayOrder,
      isKeyIngredient: ingredients.isKeyIngredient,
      concentration: productIngredients.concentration,
      isFragrance: ingredients.isFragrance,
      isComedogenic: ingredients.isComedogenic,
      ewgScore: ingredients.ewgScore,
    })
    .from(productIngredients)
    .innerJoin(ingredients, eq(productIngredients.ingredientId, ingredients.id))
    .where(eq(productIngredients.productId, row.id))
    .orderBy(asc(productIngredients.displayOrder));

  const relatedRows = await db
    .select({
      relatedProductId: relatedProducts.relatedProductId,
      relationshipType: relatedProducts.relationshipType,
      displayOrder: relatedProducts.displayOrder,
      name: products.name,
      slug: products.slug,
      basePrice: products.basePrice,
    })
    .from(relatedProducts)
    .innerJoin(products, eq(relatedProducts.relatedProductId, products.id))
    .where(and(eq(relatedProducts.productId, row.id), eq(products.isActive, true)))
    .orderBy(asc(relatedProducts.displayOrder));

  const variantIds = variantRows.map((v) => v.id);
  const allAttrs =
    variantIds.length === 0
      ? []
      : await db
          .select()
          .from(variantAttributes)
          .where(inArray(variantAttributes.variantId, variantIds));

  const attrsByVariant = new Map<string, typeof allAttrs>();
  for (const attr of allAttrs) {
    const list = attrsByVariant.get(attr.variantId) ?? [];
    list.push(attr);
    attrsByVariant.set(attr.variantId, list);
  }

  const related: RelatedProduct[] = await Promise.all(
    relatedRows.map(async (rel) => {
      const [img] = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, rel.relatedProductId))
        .orderBy(desc(productImages.isPrimary))
        .limit(1);
      return {
        relatedProductId: rel.relatedProductId,
        relationshipType: rel.relationshipType,
        note: '',
        displayOrder: rel.displayOrder,
        product: {
          name: rel.name,
          slug: rel.slug,
          basePrice: money(rel.basePrice),
          images: img ? [{ imageUrl: img.imageUrl, altText: img.altText }] : [],
        },
      };
    }),
  );

  const ratings = reviewRows.map((r) => r.rating);
  const averageRating =
    ratings.length === 0 ? 0 : Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.shortDescription,
    proTip: row.proTip ?? undefined,
    primaryCategory: category?.slug ?? 'face',
    formulationType: row.formulationType,
    basePrice: money(row.basePrice),
    compareAtPrice: row.compareAtPrice == null ? null : money(row.compareAtPrice),
    applicationInstructions: row.applicationInstructions ?? [],
    warnings: row.warnings ?? [],
    contraindications: row.contraindications ?? [],
    pregnancySafe: row.pregnancySafe,
    routineStep: row.routineStep,
    timeOfDay: row.timeOfDay,
    shelfLifeMonths: row.shelfLifeMonths,
    periodAfterOpeningMonths: row.periodAfterOpeningMonths,
    storageInstructions: row.storageInstructions ?? '',
    isVegan: row.isVegan,
    isCrueltyFree: row.isCrueltyFree,
    isFragranceFree: row.isFragranceFree,
    isReefSafe: row.isReefSafe,
    isOrganic: row.isOrganic,
    isNatural: true,
    isGlutenFree: row.isGlutenFree,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    isNewArrival: row.isFeatured && !row.isBestSeller,
    isBestSeller: row.isBestSeller,
    variants: variantRows.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      price: money(variant.price),
      compareAtPrice: variant.compareAtPrice == null ? null : money(variant.compareAtPrice),
      stockQuantity: variant.stockQuantity,
      isActive: variant.isActive,
      displayOrder: variant.displayOrder,
      attributes: (attrsByVariant.get(variant.id) ?? []).map((a) => ({
        attributeType: a.attributeType,
        value: a.value,
        hexCode: a.hexCode ?? undefined,
      })),
      images: imageRows
        .filter((img) => img.variantId === variant.id)
        .map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          altText: img.altText,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder,
        })),
    })),
    images: imageRows
      .filter((img) => !img.variantId)
      .map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText,
        isPrimary: img.isPrimary,
        displayOrder: img.displayOrder,
      })),
    averageRating,
    reviewCount: reviewRows.length,
    reviews: reviewRows.map((r) => ({
      id: r.id,
      reviewerName: r.reviewerName,
      rating: r.rating,
      date: r.createdAt.toISOString().slice(0, 10),
      comment: r.comment,
    })),
    ingredients: ingredientRows.map((ing) => ({
      id: ing.id,
      inciName: ing.inciName,
      commonName: ing.commonName,
      description: ing.description,
      displayOrder: ing.displayOrder,
      isKeyIngredient: ing.isKeyIngredient,
      concentration: ing.concentration,
      isFragrance: ing.isFragrance,
      isComedogenic: ing.isComedogenic,
      ewgScore: ing.ewgScore,
    })),
    relatedProducts: related,
  };
}

export const catalogRouter = createTRPCRouter({
  ping: publicProcedure.query(() => ({ ok: true as const })),

  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.displayOrder));
    const counts = await db
      .select({
        categoryId: products.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(products)
      .where(eq(products.isActive, true))
      .groupBy(products.categoryId);
    const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.count)]));
    return rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      productCount: countMap.get(row.id) ?? 0,
    }));
  }),

  getProducts: publicProcedure
    .input(
      z
        .object({
          categorySlug: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().int().positive().optional(),
          cursor: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getDb();
      const limit = Math.min(input?.limit ?? 24, 60);
      const search = input?.search?.trim();

      const filters = [eq(products.isActive, true)];
      if (input?.cursor) {
        filters.push(gt(products.slug, input.cursor));
      }
      if (search) {
        filters.push(
          or(
            ilike(products.name, `%${search}%`),
            ilike(products.shortDescription, `%${search}%`),
          )!,
        );
      }
      if (input?.categorySlug) {
        const category = await db.query.categories.findFirst({
          where: eq(categories.slug, input.categorySlug),
        });
        if (category) {
          filters.push(eq(products.categoryId, category.id));
        }
      }

      const rows = await db
        .select()
        .from(products)
        .where(and(...filters))
        .orderBy(asc(products.slug))
        .limit(limit + 1);

      const page = rows.slice(0, limit);
      const nextCursor = rows.length > limit ? page[page.length - 1]?.slug ?? null : null;

      const items = await Promise.all(
        page.map(async (row) => {
          const [image] = await db
            .select()
            .from(productImages)
            .where(eq(productImages.productId, row.id))
            .orderBy(desc(productImages.isPrimary), asc(productImages.displayOrder))
            .limit(1);
          const [variant] = await db
            .select()
            .from(productVariants)
            .where(and(eq(productVariants.productId, row.id), eq(productVariants.isActive, true)))
            .orderBy(asc(productVariants.displayOrder))
            .limit(1);
          const [stats] = await db
            .select({
              avg: sql<number>`coalesce(avg(${productReviews.rating}), 0)`,
              count: sql<number>`count(*)::int`,
            })
            .from(productReviews)
            .where(and(eq(productReviews.productId, row.id), eq(productReviews.isApproved, true)));

          const collection = row.isBestSeller ? 'top' : row.isFeatured ? 'new' : 'featured';
          const tag = row.isBestSeller ? 'BESTSELLER' : row.isFeatured ? 'Just launched' : 'Featured';

          return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.shortDescription,
            shortDescription: row.shortDescription,
            price: money(row.basePrice),
            size: variant?.name ?? null,
            tag,
            image: image?.imageUrl ?? '',
            rating: Number(Number(stats?.avg ?? 0).toFixed(1)),
            reviews: String(stats?.count ?? 0),
            collection,
            variantId: variant?.id ?? null,
            note: row.proTip ?? '',
          };
        }),
      );

      return { items, nextCursor };
    }),

  getProductBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const row = await db.query.products.findFirst({
        where: and(eq(products.slug, input.slug), eq(products.isActive, true)),
      });
      if (!row) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
      }
      return hydrateProduct(row);
    }),

  getFeaturedRitual: publicProcedure.query(() => mockData.eveningRitual),

  getRelatedProducts: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const product = await db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });
      if (!product) return [] as RelatedProduct[];
      const hydrated = await hydrateProduct(product);
      return hydrated.relatedProducts;
    }),
});
