export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  proTip?: string;
  primaryCategory: string;
  formulationType: string;
  basePrice: number;
  compareAtPrice?: number | null;
  applicationInstructions: string[];
  warnings: string[];
  contraindications: string[];
  pregnancySafe: boolean;
  routineStep: number;
  timeOfDay: string;
  shelfLifeMonths: number;
  periodAfterOpeningMonths: number;
  storageInstructions: string;
  isVegan: boolean;
  isCrueltyFree: boolean;
  isFragranceFree: boolean;
  isReefSafe: boolean;
  isOrganic: boolean;
  isNatural: boolean;
  isGlutenFree: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
  faceDetails?: FaceDetails;
  ingredients: Ingredient[];
  relatedProducts: RelatedProduct[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  isActive: boolean;
  displayOrder: number;
  attributes: VariantAttribute[];
  images: ProductImage[];
}

export interface VariantAttribute {
  attributeType: string;
  value: string;
  hexCode?: string;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface FaceDetails {
  skinTypes: string[];
  spf: number | null;
  isNonComedogenic: boolean;
  isHypoallergenic: boolean;
  retinoidStrength: string | null;
  acidPercentage: string | null;
}

export interface Ingredient {
  id: string;
  inciName: string;
  commonName: string;
  description: string;
  displayOrder: number;
  isKeyIngredient: boolean;
  concentration: string | null;
  isFragrance: boolean;
  isComedogenic: boolean;
  ewgScore: number;
}

export interface RelatedProduct {
  relatedProductId: string;
  relationshipType: string;
  note: string;
  displayOrder: number;
  product: {
    name: string;
    slug: string;
    basePrice: number;
    images: { imageUrl: string; altText: string }[];
  };
}

export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  product: { name: string; slug: string; primaryCategory: string };
  variant: { name: string; sku: string; attributes: VariantAttribute[] };
  image: { imageUrl: string };
}

export interface Cart {
  id: string;
  items: CartItem[];
  currency: string;
}
