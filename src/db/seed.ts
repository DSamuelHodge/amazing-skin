import 'dotenv/config';
import { getDb } from './client';
import {
  categories,
  customerProfiles,
  discountCodes,
  ingredients,
  productImages,
  productIngredients,
  productReviews,
  productVariants,
  products,
  relatedProducts,
  users,
  variantAttributes,
} from './schema';
import { mockData } from '../data/mockData';
import { AGENT_SUPERADMIN } from '../lib/agent-superadmin';

const money = (value: number) => value.toFixed(2);

// Stable UUIDs so re-seed updates the same rows.
const IDS = {
  catFace: '11111111-1111-4111-8111-111111111111',
  catBody: '11111111-1111-4111-8111-111111111112',
  catRitual: '11111111-1111-4111-8111-111111111113',

  prodGlow: '22222222-2222-4222-8222-222222222201',
  prodBarrier: '22222222-2222-4222-8222-222222222202',
  prodCloudMelt: '22222222-2222-4222-8222-222222222203',
  prodVelvetLock: '22222222-2222-4222-8222-222222222204',
  prodMidnight: '22222222-2222-4222-8222-222222222205',
  prodVelvetOil: '22222222-2222-4222-8222-222222222206',
  prodDaylight: '22222222-2222-4222-8222-222222222207',

  varLgs30: '33333333-3333-4333-8333-333333333301',
  varLgs50: '33333333-3333-4333-8333-333333333302',
  varLgs100: '33333333-3333-4333-8333-333333333303',
  varLbs30: '33333333-3333-4333-8333-333333333304',
  varCmc120: '33333333-3333-4333-8333-333333333305',
  varVlm50: '33333333-3333-4333-8333-333333333306',
  varMrm60: '33333333-3333-4333-8333-333333333307',
  varVoc150: '33333333-3333-4333-8333-333333333308',
  varDds50: '33333333-3333-4333-8333-333333333309',

  discLumina10: '55555555-5555-4555-8555-555555555501',
  discGlow20: '55555555-5555-4555-8555-555555555502',
  discWelcome50: '55555555-5555-4555-8555-555555555503',
  discSave10: '55555555-5555-4555-8555-555555555504',

  agentUser: AGENT_SUPERADMIN.id,
  agentProfile: '00000000-0000-4000-8000-000000000002',
} as const;

const GLOW_VARIANT_IDS = [IDS.varLgs30, IDS.varLgs50, IDS.varLgs100] as const;

function asHtml(text: string): string {
  if (text.includes('<p>')) return text;
  return `<p>${text}</p>`;
}

async function main() {
  const db = await getDb();
  const glow = mockData.productDetails;
  const ritual = mockData.eveningRitual;
  const shop = mockData.shop;

  const [cleanseStep, treatStep, sealStep] = ritual.steps;
  const [midnightArrival, velvetOilArrival, daylightArrival] = shop.newArrivals;
  const [barrierShop, cloudMeltShop, velvetLockShop] = shop.topProducts;

  console.log('[db] Seeding catalog…');

  await db
    .insert(users)
    .values({
      id: IDS.agentUser,
      email: AGENT_SUPERADMIN.email,
      role: 'super_admin',
      isEmailVerified: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        role: 'super_admin',
        isEmailVerified: true,
      },
    });

  await db
    .insert(customerProfiles)
    .values({
      id: IDS.agentProfile,
      userId: IDS.agentUser,
      firstName: 'Lumina',
      lastName: 'Agent',
      loyaltyTier: 'Founder',
      loyaltyPoints: 0,
    })
    .onConflictDoUpdate({
      target: customerProfiles.userId,
      set: {
        firstName: 'Lumina',
        lastName: 'Agent',
        loyaltyTier: 'Founder',
      },
    });

  const categoryRows = [
    {
      id: IDS.catFace,
      name: 'Face',
      slug: 'face',
      description: 'Daily facial formulas for barrier support, glow, and protection.',
      displayOrder: 1,
      isActive: true,
    },
    {
      id: IDS.catBody,
      name: 'Body',
      slug: 'body',
      description: 'Body care that extends the Lumina ritual below the neck.',
      displayOrder: 2,
      isActive: true,
    },
    {
      id: IDS.catRitual,
      name: 'Ritual',
      slug: 'ritual',
      description: 'Evening and overnight ritual steps designed to be layered together.',
      displayOrder: 3,
      isActive: true,
    },
  ];

  for (const row of categoryRows) {
    const { id: _id, slug: _slug, ...rest } = row;
    await db.insert(categories).values(row).onConflictDoUpdate({
      target: categories.slug,
      set: rest,
    });
  }

  const productRows = [
    {
      id: IDS.prodGlow,
      name: glow.name,
      slug: glow.slug,
      shortDescription: glow.shortDescription,
      description: glow.description,
      proTip: glow.proTip ?? null,
      categoryId: IDS.catFace,
      formulationType: glow.formulationType,
      basePrice: money(glow.basePrice),
      compareAtPrice: glow.compareAtPrice != null ? money(glow.compareAtPrice) : null,
      applicationInstructions: glow.applicationInstructions,
      warnings: glow.warnings,
      contraindications: glow.contraindications,
      pregnancySafe: glow.pregnancySafe,
      routineStep: glow.routineStep,
      timeOfDay: glow.timeOfDay,
      shelfLifeMonths: glow.shelfLifeMonths,
      periodAfterOpeningMonths: glow.periodAfterOpeningMonths,
      storageInstructions: glow.storageInstructions,
      isVegan: glow.isVegan,
      isCrueltyFree: glow.isCrueltyFree,
      isFragranceFree: glow.isFragranceFree,
      isReefSafe: glow.isReefSafe,
      isOrganic: glow.isOrganic,
      isGlutenFree: glow.isGlutenFree,
      isActive: glow.isActive,
      isFeatured: glow.isFeatured,
      isBestSeller: glow.isBestSeller,
      metaTitle: `${glow.name} | Lumina Skin Rituals`,
      metaDescription: glow.shortDescription,
    },
    {
      id: IDS.prodBarrier,
      name: treatStep.title,
      slug: 'lumina-barrier-serum',
      shortDescription: barrierShop.description,
      description: asHtml(treatStep.description),
      proTip: treatStep.bullets.join(' '),
      categoryId: IDS.catFace,
      formulationType: 'serum',
      basePrice: money(42),
      compareAtPrice: null,
      applicationInstructions: [
        'After cleansing, press 2–3 drops onto face and neck.',
        'Layer while skin is still slightly damp.',
        'Follow with Velvet Lock Moisture Cream.',
      ],
      warnings: ['For external use only.', 'Avoid direct contact with eyes.'],
      contraindications: [] as string[],
      pregnancySafe: true,
      routineStep: 2,
      timeOfDay: 'evening',
      shelfLifeMonths: 24,
      periodAfterOpeningMonths: 12,
      storageInstructions: 'Store in a cool, dry place away from direct sunlight.',
      isVegan: true,
      isCrueltyFree: true,
      isFragranceFree: true,
      isReefSafe: true,
      isOrganic: false,
      isGlutenFree: true,
      isActive: true,
      isFeatured: true,
      isBestSeller: true,
      metaTitle: 'Lumina Barrier Serum | Lumina Skin Rituals',
      metaDescription: barrierShop.description,
    },
    {
      id: IDS.prodCloudMelt,
      name: cleanseStep.title,
      slug: 'cloud-melt-cleansing-gel',
      shortDescription: cloudMeltShop.description,
      description: asHtml(cleanseStep.description),
      proTip: cleanseStep.bullets.join(' '),
      categoryId: IDS.catRitual,
      formulationType: 'cleanser',
      basePrice: money(29),
      compareAtPrice: null,
      applicationInstructions: [
        'Massage a pearl-sized amount over dry or damp skin.',
        'Add water to melt makeup and SPF, then rinse.',
        'Pat dry and continue with serum.',
      ],
      warnings: ['For external use only.', 'Ophthalmologist tested — still avoid getting product directly in eyes.'],
      contraindications: [] as string[],
      pregnancySafe: true,
      routineStep: 1,
      timeOfDay: 'both',
      shelfLifeMonths: 24,
      periodAfterOpeningMonths: 12,
      storageInstructions: 'Store at room temperature with the cap closed.',
      isVegan: true,
      isCrueltyFree: true,
      isFragranceFree: true,
      isReefSafe: true,
      isOrganic: false,
      isGlutenFree: true,
      isActive: true,
      isFeatured: false,
      isBestSeller: true,
      metaTitle: 'Cloud Melt Cleansing Gel | Lumina Skin Rituals',
      metaDescription: cloudMeltShop.description,
    },
    {
      id: IDS.prodVelvetLock,
      name: sealStep.title,
      slug: 'velvet-lock-moisture-cream',
      shortDescription: velvetLockShop.description,
      description: asHtml(sealStep.description),
      proTip: sealStep.bullets.join(' '),
      categoryId: IDS.catRitual,
      formulationType: 'cream',
      basePrice: money(38),
      compareAtPrice: null,
      applicationInstructions: [
        'Warm a pea-sized amount between fingertips.',
        'Press over serum to seal in hydration.',
        'Use nightly; add a second layer on extra-dry patches.',
      ],
      warnings: ['For external use only.'],
      contraindications: [] as string[],
      pregnancySafe: true,
      routineStep: 3,
      timeOfDay: 'evening',
      shelfLifeMonths: 24,
      periodAfterOpeningMonths: 12,
      storageInstructions: 'Keep away from heat and direct sunlight.',
      isVegan: true,
      isCrueltyFree: true,
      isFragranceFree: true,
      isReefSafe: true,
      isOrganic: false,
      isGlutenFree: true,
      isActive: true,
      isFeatured: false,
      isBestSeller: true,
      metaTitle: 'Velvet Lock Moisture Cream | Lumina Skin Rituals',
      metaDescription: velvetLockShop.description,
    },
    {
      id: IDS.prodMidnight,
      name: midnightArrival.title,
      slug: 'midnight-recovery-mask',
      shortDescription: midnightArrival.description,
      description: asHtml(midnightArrival.description),
      proTip: midnightArrival.note,
      categoryId: IDS.catRitual,
      formulationType: 'mask',
      basePrice: money(54),
      compareAtPrice: null,
      applicationInstructions: [
        'Apply a thin layer as the last step 2–3 nights per week.',
        'Leave on overnight and rinse in the morning if any residue remains.',
      ],
      warnings: ['For external use only.'],
      contraindications: [] as string[],
      pregnancySafe: true,
      routineStep: 4,
      timeOfDay: 'evening',
      shelfLifeMonths: 24,
      periodAfterOpeningMonths: 12,
      storageInstructions: 'Store in a cool, dry place.',
      isVegan: true,
      isCrueltyFree: true,
      isFragranceFree: true,
      isReefSafe: true,
      isOrganic: false,
      isGlutenFree: true,
      isActive: true,
      isFeatured: true,
      isBestSeller: false,
      metaTitle: 'Midnight Recovery Mask | Lumina Skin Rituals',
      metaDescription: midnightArrival.description,
    },
    {
      id: IDS.prodVelvetOil,
      name: velvetOilArrival.title,
      slug: 'velvet-oil-cleanser',
      shortDescription: velvetOilArrival.description,
      description: asHtml(velvetOilArrival.description),
      proTip: velvetOilArrival.note,
      categoryId: IDS.catRitual,
      formulationType: 'oil cleanser',
      basePrice: money(36),
      compareAtPrice: null,
      applicationInstructions: [
        'Massage over dry skin to dissolve makeup and SPF.',
        'Emulsify with water and rinse — no washcloth required.',
        'Follow with Cloud Melt if you prefer a double cleanse.',
      ],
      warnings: ['For external use only.'],
      contraindications: [] as string[],
      pregnancySafe: true,
      routineStep: 1,
      timeOfDay: 'evening',
      shelfLifeMonths: 24,
      periodAfterOpeningMonths: 12,
      storageInstructions: 'Store upright at room temperature.',
      isVegan: true,
      isCrueltyFree: true,
      isFragranceFree: true,
      isReefSafe: true,
      isOrganic: false,
      isGlutenFree: true,
      isActive: true,
      isFeatured: true,
      isBestSeller: false,
      metaTitle: 'Velvet Oil Cleanser | Lumina Skin Rituals',
      metaDescription: velvetOilArrival.description,
    },
    {
      id: IDS.prodDaylight,
      name: daylightArrival.title,
      slug: 'daylight-dew-spf-30',
      shortDescription: daylightArrival.description,
      description: asHtml(daylightArrival.description),
      proTip: daylightArrival.note,
      categoryId: IDS.catFace,
      formulationType: 'sunscreen',
      basePrice: money(48),
      compareAtPrice: null,
      applicationInstructions: [
        'Apply generously as the last morning step.',
        'Reapply every two hours with sun exposure.',
      ],
      warnings: ['For external use only.', 'Avoid contact with eyes.'],
      contraindications: [] as string[],
      pregnancySafe: true,
      routineStep: 4,
      timeOfDay: 'morning',
      shelfLifeMonths: 24,
      periodAfterOpeningMonths: 12,
      storageInstructions: 'Store below 25°C away from direct sunlight.',
      isVegan: true,
      isCrueltyFree: true,
      isFragranceFree: true,
      isReefSafe: true,
      isOrganic: false,
      isGlutenFree: true,
      isActive: true,
      isFeatured: true,
      isBestSeller: false,
      metaTitle: 'Daylight Dew SPF 30 | Lumina Skin Rituals',
      metaDescription: daylightArrival.description,
    },
  ];

  for (const row of productRows) {
    const { id: _id, slug: _slug, ...rest } = row;
    await db.insert(products).values(row).onConflictDoUpdate({
      target: products.slug,
      set: rest,
    });
  }

  const variantRows = [
    ...glow.variants.map((variant, index) => ({
      id: GLOW_VARIANT_IDS[index],
      productId: IDS.prodGlow,
      sku: variant.sku,
      name: variant.name,
      price: money(variant.price),
      compareAtPrice: variant.compareAtPrice != null ? money(variant.compareAtPrice) : null,
      stockQuantity: variant.stockQuantity,
      reservedQuantity: 0,
      lowStockThreshold: 10,
      weightGrams: Number.parseInt(variant.name, 10) || 30,
      isActive: variant.isActive,
      displayOrder: variant.displayOrder,
    })),
    {
      id: IDS.varLbs30,
      productId: IDS.prodBarrier,
      sku: 'LBS-30',
      name: treatStep.size,
      price: money(42),
      compareAtPrice: null,
      stockQuantity: 12,
      reservedQuantity: 0,
      lowStockThreshold: 15,
      weightGrams: 30,
      isActive: true,
      displayOrder: 1,
    },
    {
      id: IDS.varCmc120,
      productId: IDS.prodCloudMelt,
      sku: 'CMC-120',
      name: cleanseStep.size,
      price: money(29),
      compareAtPrice: null,
      stockQuantity: 142,
      reservedQuantity: 0,
      lowStockThreshold: 20,
      weightGrams: 120,
      isActive: true,
      displayOrder: 1,
    },
    {
      id: IDS.varVlm50,
      productId: IDS.prodVelvetLock,
      sku: 'VLM-50',
      name: sealStep.size,
      price: money(38),
      compareAtPrice: null,
      stockQuantity: 89,
      reservedQuantity: 0,
      lowStockThreshold: 15,
      weightGrams: 50,
      isActive: true,
      displayOrder: 1,
    },
    {
      id: IDS.varMrm60,
      productId: IDS.prodMidnight,
      sku: 'MRM-60',
      name: midnightArrival.size,
      price: money(54),
      compareAtPrice: null,
      stockQuantity: 25,
      reservedQuantity: 0,
      lowStockThreshold: 10,
      weightGrams: 60,
      isActive: true,
      displayOrder: 1,
    },
    {
      id: IDS.varVoc150,
      productId: IDS.prodVelvetOil,
      sku: 'VOC-150',
      name: velvetOilArrival.size,
      price: money(36),
      compareAtPrice: null,
      stockQuantity: 30,
      reservedQuantity: 0,
      lowStockThreshold: 10,
      weightGrams: 150,
      isActive: true,
      displayOrder: 1,
    },
    {
      id: IDS.varDds50,
      productId: IDS.prodDaylight,
      sku: 'DDS-50',
      name: daylightArrival.size,
      price: money(48),
      compareAtPrice: null,
      stockQuantity: 40,
      reservedQuantity: 0,
      lowStockThreshold: 10,
      weightGrams: 50,
      isActive: true,
      displayOrder: 1,
    },
  ];

  for (const row of variantRows) {
    const { id: _id, sku: _sku, ...rest } = row;
    await db.insert(productVariants).values(row).onConflictDoUpdate({
      target: productVariants.sku,
      set: rest,
    });
  }

  const attributeRows = [
    ...glow.variants.flatMap((variant, index) =>
      variant.attributes.map((attr, attrIndex) => ({
        id: `44444444-4444-4444-8444-4444444444${String(index * 10 + attrIndex + 1).padStart(2, '0')}`,
        variantId: GLOW_VARIANT_IDS[index],
        attributeType: attr.attributeType,
        value: attr.value,
        hexCode: attr.hexCode ?? null,
      })),
    ),
    { id: '44444444-4444-4444-8444-444444444411', variantId: IDS.varLbs30, attributeType: 'size', value: treatStep.size, hexCode: null },
    { id: '44444444-4444-4444-8444-444444444412', variantId: IDS.varCmc120, attributeType: 'size', value: cleanseStep.size, hexCode: null },
    { id: '44444444-4444-4444-8444-444444444413', variantId: IDS.varVlm50, attributeType: 'size', value: sealStep.size, hexCode: null },
    { id: '44444444-4444-4444-8444-444444444414', variantId: IDS.varMrm60, attributeType: 'size', value: midnightArrival.size, hexCode: null },
    { id: '44444444-4444-4444-8444-444444444415', variantId: IDS.varVoc150, attributeType: 'size', value: velvetOilArrival.size, hexCode: null },
    { id: '44444444-4444-4444-8444-444444444416', variantId: IDS.varDds50, attributeType: 'size', value: daylightArrival.size, hexCode: null },
  ];

  for (const row of attributeRows) {
    const { id: _id, ...rest } = row;
    await db.insert(variantAttributes).values(row).onConflictDoUpdate({
      target: variantAttributes.id,
      set: rest,
    });
  }

  const imageRows = [
    ...glow.images.map((image, index) => ({
      id: `66666666-6666-4666-8666-6666666666${String(index + 1).padStart(2, '0')}`,
      productId: IDS.prodGlow,
      variantId: null as string | null,
      imageUrl: image.imageUrl,
      altText: image.altText,
      isPrimary: image.isPrimary,
      displayOrder: image.displayOrder,
    })),
    {
      id: '66666666-6666-4666-8666-666666666611',
      productId: IDS.prodBarrier,
      variantId: null,
      imageUrl: barrierShop.image,
      altText: treatStep.title,
      isPrimary: true,
      displayOrder: 1,
    },
    {
      id: '66666666-6666-4666-8666-666666666612',
      productId: IDS.prodCloudMelt,
      variantId: null,
      imageUrl: cloudMeltShop.image,
      altText: cleanseStep.title,
      isPrimary: true,
      displayOrder: 1,
    },
    {
      id: '66666666-6666-4666-8666-666666666613',
      productId: IDS.prodVelvetLock,
      variantId: null,
      imageUrl: velvetLockShop.image,
      altText: sealStep.title,
      isPrimary: true,
      displayOrder: 1,
    },
    {
      id: '66666666-6666-4666-8666-666666666614',
      productId: IDS.prodMidnight,
      variantId: null,
      imageUrl: midnightArrival.image,
      altText: midnightArrival.title,
      isPrimary: true,
      displayOrder: 1,
    },
    {
      id: '66666666-6666-4666-8666-666666666615',
      productId: IDS.prodVelvetOil,
      variantId: null,
      imageUrl: velvetOilArrival.image,
      altText: velvetOilArrival.title,
      isPrimary: true,
      displayOrder: 1,
    },
    {
      id: '66666666-6666-4666-8666-666666666616',
      productId: IDS.prodDaylight,
      variantId: null,
      imageUrl: daylightArrival.image,
      altText: daylightArrival.title,
      isPrimary: true,
      displayOrder: 1,
    },
  ];

  for (const row of imageRows) {
    const { id: _id, ...rest } = row;
    await db.insert(productImages).values(row).onConflictDoUpdate({
      target: productImages.id,
      set: rest,
    });
  }

  const ingredientRows = glow.ingredients.map((ingredient, index) => ({
    id: `77777777-7777-4777-8777-7777777777${String(index + 1).padStart(2, '0')}`,
    inciName: ingredient.inciName,
    commonName: ingredient.commonName,
    description: ingredient.description,
    ewgScore: ingredient.ewgScore,
    isKeyIngredient: ingredient.isKeyIngredient,
    isFragrance: ingredient.isFragrance,
    isComedogenic: ingredient.isComedogenic,
  }));

  for (const row of ingredientRows) {
    const { id: _id, inciName: _inci, ...rest } = row;
    await db.insert(ingredients).values(row).onConflictDoUpdate({
      target: ingredients.inciName,
      set: rest,
    });
  }

  const productIngredientRows = glow.ingredients.map((ingredient, index) => ({
    productId: IDS.prodGlow,
    ingredientId: `77777777-7777-4777-8777-7777777777${String(index + 1).padStart(2, '0')}`,
    concentration: ingredient.concentration,
    displayOrder: ingredient.displayOrder,
  }));

  for (const row of productIngredientRows) {
    const { productId: _pid, ingredientId: _iid, ...rest } = row;
    await db.insert(productIngredients).values(row).onConflictDoUpdate({
      target: [productIngredients.productId, productIngredients.ingredientId],
      set: rest,
    });
  }

  const reviewRows = glow.reviews.map((review, index) => ({
    id: `88888888-8888-4888-8888-8888888888${String(index + 1).padStart(2, '0')}`,
    productId: IDS.prodGlow,
    userId: null as string | null,
    reviewerName: review.reviewerName,
    rating: review.rating,
    headline: null as string | null,
    comment: review.comment,
    isVerifiedPurchase: true,
    isApproved: true,
    skinTypeReported: null,
    createdAt: new Date(review.date),
  }));

  for (const row of reviewRows) {
    const { id: _id, ...rest } = row;
    await db.insert(productReviews).values(row).onConflictDoUpdate({
      target: productReviews.id,
      set: rest,
    });
  }

  const relatedRows = [
    {
      productId: IDS.prodGlow,
      relatedProductId: IDS.prodCloudMelt,
      relationshipType: 'Complete the Routine',
      displayOrder: 1,
    },
    {
      productId: IDS.prodGlow,
      relatedProductId: IDS.prodVelvetLock,
      relationshipType: 'Complete the Routine',
      displayOrder: 2,
    },
    {
      productId: IDS.prodGlow,
      relatedProductId: IDS.prodMidnight,
      relationshipType: 'Similar Products',
      displayOrder: 3,
    },
  ];

  for (const row of relatedRows) {
    const { productId: _pid, relatedProductId: _rid, ...rest } = row;
    await db.insert(relatedProducts).values(row).onConflictDoUpdate({
      target: [relatedProducts.productId, relatedProducts.relatedProductId],
      set: rest,
    });
  }

  const discountRows = [
    {
      id: IDS.discLumina10,
      code: 'LUMINA10',
      discountType: 'fixed_amount' as const,
      discountValue: money(10),
      minSubtotal: money(0),
      usageLimitTotal: null,
      usageLimitPerCustomer: 1,
      isActive: true,
    },
    {
      id: IDS.discGlow20,
      code: 'GLOW20',
      discountType: 'percentage' as const,
      discountValue: money(20),
      minSubtotal: money(0),
      usageLimitTotal: null,
      usageLimitPerCustomer: 1,
      isActive: true,
    },
    {
      id: IDS.discWelcome50,
      code: 'WELCOME50',
      discountType: 'fixed_amount' as const,
      discountValue: money(15),
      minSubtotal: money(0),
      usageLimitTotal: null,
      usageLimitPerCustomer: 1,
      isActive: true,
    },
    {
      id: IDS.discSave10,
      code: 'SAVE10',
      discountType: 'fixed_amount' as const,
      discountValue: money(10),
      minSubtotal: money(0),
      usageLimitTotal: null,
      usageLimitPerCustomer: 1,
      isActive: true,
    },
  ];

  for (const row of discountRows) {
    const { id: _id, code: _code, ...rest } = row;
    await db.insert(discountCodes).values(row).onConflictDoUpdate({
      target: discountCodes.code,
      set: rest,
    });
  }

  console.log('[db] Seed complete: superadmin agent, 3 categories, 7 products, 9 variants, 4 discount codes');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[db] Seed failed:', err);
    process.exit(1);
  });
