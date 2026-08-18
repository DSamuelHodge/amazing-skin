import { z } from 'zod';
import { mockData } from '@/src/data/mockData';
import type { Product } from '@/src/types';
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

type ShopCard = (typeof mockData.shop.newArrivals)[number] | (typeof mockData.shop.topProducts)[number];

function shopCards(): ShopCard[] {
  return [...mockData.shop.newArrivals, ...mockData.shop.topProducts];
}

function shopToListItem(item: ShopCard, index: number, collection: string) {
  const slug = slugify(item.title);
  return {
    id: `shop_${collection}_${index}`,
    name: item.title,
    slug,
    description: item.description,
    shortDescription: item.description,
    price: parsePrice(item.price),
    size: item.size,
    tag: item.tag,
    image: item.image,
    rating: 'rating' in item ? item.rating : null,
    reviews: 'reviews' in item ? item.reviews : null,
    collection,
  };
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

export const catalogRouter = createTRPCRouter({
  ping: publicProcedure.query(() => ({ ok: true as const })),

  getCategories: publicProcedure.query(() => {
    return [
      { slug: 'face', name: 'Face', productCount: shopCards().length + 1 },
      { slug: 'rituals', name: 'Rituals', productCount: 1 },
    ];
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
    .query(({ input }) => {
      const featured = mockData.productDetails;
      const items = [
        {
          id: featured.id,
          name: featured.name,
          slug: featured.slug,
          description: featured.shortDescription,
          shortDescription: featured.shortDescription,
          price: featured.basePrice,
          size: featured.variants[0]?.name ?? null,
          tag: featured.isBestSeller ? 'BESTSELLER' : 'Featured',
          image: featured.images[0]?.imageUrl ?? '',
          rating: featured.averageRating,
          reviews: String(featured.reviewCount),
          collection: 'featured',
        },
        ...mockData.shop.newArrivals.map((item, i) => shopToListItem(item, i, 'new')),
        ...mockData.shop.topProducts.map((item, i) => shopToListItem(item, i, 'top')),
      ];

      const search = input?.search?.trim().toLowerCase();
      const filtered = search
        ? items.filter(
            (item) =>
              item.name.toLowerCase().includes(search) ||
              item.description.toLowerCase().includes(search),
          )
        : items;

      const limit = input?.limit ?? filtered.length;
      return {
        items: filtered.slice(0, limit),
        nextCursor: null as string | null,
      };
    }),

  getProductBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      if (input.slug === mockData.productDetails.slug) {
        return mockData.productDetails;
      }
      const shopMatch = shopCards().find((item) => slugify(item.title) === input.slug);
      if (shopMatch) {
        return shopToProduct(shopMatch);
      }
      // Fallback so the storefront PDP does not break while catalog is mocked.
      return mockData.productDetails;
    }),

  getFeaturedRitual: publicProcedure.query(() => mockData.eveningRitual),

  getRelatedProducts: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(() => mockData.productDetails.relatedProducts),
});
