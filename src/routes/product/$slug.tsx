import React, { useState, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mockData } from '@/src/data/mockData';
import { ImageGallery } from '@/src/components/blocks/ImageGallery';
import { PurchaseBlock } from '@/src/components/blocks/PurchaseBlock';
import { ProductAccordion } from '@/src/components/blocks/ProductAccordion';
import { RelatedProducts } from '@/src/components/blocks/RelatedProducts';
import { ProductReviews } from '@/src/components/blocks/ProductReviews';
import { trpc, useCartStore } from '@/src/lib/trpc';

// --- MOCKS ---
// Mocking Route for the sake of this component
const Route = {
  useParams: () => ({ slug: 'lumina-glow-serum' })
};

export default function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading, isError } = trpc.products.bySlug.useQuery({ slug });
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<'one-time' | 'subscribe'>('one-time');
  const [subscriptionFrequency, setSubscriptionFrequency] = useState('monthly');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { openDrawer } = useCartStore();

  // Initialize selected variant when product loads
  React.useEffect(() => {
    if (product && product.variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product, selectedVariantId]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((v: any) => v.id === selectedVariantId) || product.variants[0];
  }, [product, selectedVariantId]);

  const displayImages = useMemo(() => {
    if (!product) return [];
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }
    return product.images;
  }, [product, selectedVariant]);

  const addItemMutation = trpc.cart.addItem.useMutation();

  const handleAddToCart = () => {
    if (!selectedVariantId) return;
    setIsAddingToCart(true);
    addItemMutation.mutate(
      { variantId: selectedVariantId, quantity },
      {
        onSuccess: () => {
          setIsAddingToCart(false);
          toast.success(`${quantity}x ${product.name} added to cart`, {
            description: selectedVariant?.name !== 'Default' ? `Variant: ${selectedVariant?.name}` : undefined,
            icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
          });
          openDrawer();
        },
        onError: () => {
          setIsAddingToCart(false);
          toast.error("Failed to add to cart");
        }
      }
    );
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success("Added to wishlist");
    } else {
      toast("Removed from wishlist");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#f4eadf] text-stone-900 min-h-screen w-full">
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex flex-col gap-4">
              <div className="aspect-[4/5] w-full bg-muted rounded-lg"></div>
              <div className="flex gap-4 overflow-x-auto">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-[72px] h-[72px] bg-muted rounded-md flex-shrink-0"></div>)}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-10 w-3/4 bg-muted rounded"></div>
              <div className="h-6 w-32 bg-muted rounded"></div>
              <div className="h-12 w-1/3 bg-muted rounded"></div>
              <div className="h-24 w-full bg-muted rounded mt-4"></div>
              <div className="h-12 w-full bg-muted rounded mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="bg-[#f4eadf] text-stone-900 min-h-screen w-full">
        <div className="container mx-auto px-4 py-24 max-w-7xl flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-serif mb-4">Product not found</h1>
          <p className="text-muted-foreground mb-8">The product you are looking for does not exist or has been removed.</p>
          <Button variant="outline">Back to Shop</Button>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.basePrice;
  const comparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const savings = comparePrice ? comparePrice - currentPrice : 0;
  const stockQuantity = selectedVariant?.stockQuantity ?? 0;
  const isOutOfStock = stockQuantity === 0;

  // Group variants by attribute type
  const variantAttributes = product.variants.reduce((acc: any, variant: any) => {
    variant.attributes.forEach((attr: any) => {
      if (!acc[attr.attributeType]) {
        acc[attr.attributeType] = [];
      }
      if (!acc[attr.attributeType].find((a: any) => a.value === attr.value)) {
        acc[attr.attributeType].push({
          value: attr.value,
          variantId: variant.id,
          hexCode: attr.hexCode // if available
        });
      }
    });
    return acc;
  }, {});

  // Claims
  const claims = [
    { flag: product.isVegan, label: "Vegan" },
    { flag: product.isCrueltyFree, label: "Cruelty-Free" },
    { flag: product.isFragranceFree, label: "Fragrance-Free" },
    { flag: product.isOrganic, label: "Organic" },
    { flag: product.isNatural, label: "Natural" },
    { flag: product.isGlutenFree, label: "Gluten-Free" },
    { flag: product.pregnancySafe, label: "Pregnancy Safe" },
    { flag: product.isReefSafe, label: "Reef Safe" }
  ].filter(c => c.flag);

  // Related products grouped by relationship
  const relatedGroups = product.relatedProducts.reduce((acc: any, rel: any) => {
    if (!acc[rel.relationshipType]) {
      acc[rel.relationshipType] = [];
    }
    acc[rel.relationshipType].push(rel);
    return acc;
  }, {});

  return (
    <div className="bg-[#f4eadf] text-stone-900 min-h-screen w-full">
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        {/* Breadcrumbs could go here */}
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start relative">
          
          {/* LEFT — IMAGE GALLERY */}
          <ImageGallery 
            displayImages={displayImages}
            selectedImageIndex={selectedImageIndex}
            setSelectedImageIndex={setSelectedImageIndex}
            productName={product.name}
          />

          {/* RIGHT — PURCHASE BLOCK */}
          <div className="flex flex-col gap-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-hide lg:pr-4">
            <PurchaseBlock 
              product={product}
              selectedVariantId={selectedVariantId}
              setSelectedVariantId={setSelectedVariantId}
              quantity={quantity}
              setQuantity={setQuantity}
              isWishlisted={isWishlisted}
              handleWishlistToggle={handleWishlistToggle}
              subscriptionType={subscriptionType}
              setSubscriptionType={setSubscriptionType}
              subscriptionFrequency={subscriptionFrequency}
              setSubscriptionFrequency={setSubscriptionFrequency}
              isAddingToCart={isAddingToCart}
              handleAddToCart={handleAddToCart}
              variantAttributes={variantAttributes}
              currentPrice={currentPrice}
              comparePrice={comparePrice}
              savings={savings}
              stockQuantity={stockQuantity}
              isOutOfStock={isOutOfStock}
              claims={claims}
            />

            {/* BELOW FOLD — ACCORDION */}
            <ProductAccordion product={product} />
          </div>
        </div>

        {/* PRODUCT REVIEWS */}
        <ProductReviews 
          reviews={product.reviews || []} 
          averageRating={product.averageRating} 
          reviewCount={product.reviewCount} 
        />

        {/* RELATED PRODUCTS */}
        <RelatedProducts relatedGroups={relatedGroups} />
      </div>
    </div>
  );
}
