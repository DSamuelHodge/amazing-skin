import React from 'react';
import { Star, StarHalf, Minus, Plus, Heart, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Separator } from '@/src/components/ui/separator';
import { cn } from '@/src/lib/utils';
import { Product } from '@/src/types';

interface PurchaseBlockProps {
  product: Product;
  selectedVariantId: string | null;
  setSelectedVariantId: (id: string) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  isWishlisted: boolean;
  handleWishlistToggle: () => void;
  subscriptionType: 'one-time' | 'subscribe';
  setSubscriptionType: (type: 'one-time' | 'subscribe') => void;
  subscriptionFrequency: string;
  setSubscriptionFrequency: (freq: string) => void;
  isAddingToCart: boolean;
  handleAddToCart: () => void;
  variantAttributes: any;
  currentPrice: number;
  comparePrice: number;
  savings: number;
  stockQuantity: number;
  isOutOfStock: boolean;
  claims: any[];
}

export const PurchaseBlock = ({
  product,
  selectedVariantId,
  setSelectedVariantId,
  quantity,
  setQuantity,
  isWishlisted,
  handleWishlistToggle,
  subscriptionType,
  setSubscriptionType,
  subscriptionFrequency,
  setSubscriptionFrequency,
  isAddingToCart,
  handleAddToCart,
  variantAttributes,
  currentPrice,
  comparePrice,
  savings,
  stockQuantity,
  isOutOfStock,
  claims
}: PurchaseBlockProps) => {
  return (
    <div className="flex flex-col gap-8">
      
      {/* A. Header */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-semibold">
          {product.primaryCategory}
        </span>
        <h1 className="text-3xl lg:text-4xl font-serif text-foreground leading-tight">
          {product.name}
        </h1>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => {
              const ratingValue = i + 1;
              if (product.averageRating >= ratingValue) {
                return <Star key={i} className="w-4 h-4 fill-current" />;
              } else if (product.averageRating >= ratingValue - 0.5) {
                return <StarHalf key={i} className="w-4 h-4 fill-current" />;
              }
              return <Star key={i} className="w-4 h-4 text-muted" />;
            })}
          </div>
          <a href="#reviews" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
            {product.reviewCount} reviews
          </a>
        </div>

        <div className="flex items-end gap-3 mt-2">
          <span className="text-2xl font-semibold">${currentPrice.toFixed(2)}</span>
          {comparePrice && comparePrice > currentPrice && (
            <>
              <span className="text-lg text-muted-foreground line-through mb-0.5">${comparePrice.toFixed(2)}</span>
              <span className="text-sm font-medium text-green-600 mb-1">Save ${savings.toFixed(2)}</span>
            </>
          )}
        </div>

        <p className="text-muted-foreground text-base mt-2 leading-relaxed">
          {product.shortDescription}
        </p>
      </div>

      <Separator />

      {/* B. Variant Selector */}
      {Object.keys(variantAttributes).length > 0 && (
        <div className="flex flex-col gap-6">
          {Object.entries(variantAttributes).map(([attrType, options]: [string, any]) => (
            <div key={attrType} className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{attrType}</span>
                <span className="text-sm text-muted-foreground">
                  {options.find((o: any) => o.variantId === selectedVariantId)?.value}
                </span>
              </div>
              
              {attrType.toLowerCase() === 'color' || attrType.toLowerCase() === 'shade' ? (
                <div className="flex flex-wrap gap-3">
                  {options.map((opt: any) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedVariantId(opt.variantId)}
                      className={cn(
                        "w-8 h-8 rounded-full border border-border/50 transition-all",
                        selectedVariantId === opt.variantId ? "ring-2 ring-offset-2 ring-primary" : "hover:scale-110"
                      )}
                      style={{ backgroundColor: opt.hexCode || '#ccc' }}
                      title={opt.value}
                      aria-label={`Select ${opt.value}`}
                    />
                  ))}
                </div>
              ) : attrType.toLowerCase() === 'size' ? (
                <div className="flex flex-wrap gap-2">
                  {options.map((opt: any) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedVariantId(opt.variantId)}
                      className={cn(
                        "px-4 py-2 text-sm rounded-full border transition-all",
                        selectedVariantId === opt.variantId 
                          ? "border-primary bg-primary text-primary-foreground" 
                          : "border-border hover:border-primary/50 bg-background"
                      )}
                    >
                      {opt.value}
                    </button>
                  ))}
                </div>
              ) : (
                <Select value={selectedVariantId || undefined} onValueChange={setSelectedVariantId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Select ${attrType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((opt: any) => (
                      <SelectItem key={opt.variantId} value={opt.variantId}>
                        {opt.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      )}

      {/* G. Subscribe & Save toggle */}
      <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-muted/30">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="radio" 
              name="purchaseType" 
              value="one-time" 
              checked={subscriptionType === 'one-time'}
              onChange={() => setSubscriptionType('one-time')}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
            />
            <span className="text-sm font-medium">One-time purchase</span>
            <span className="ml-auto text-sm">${currentPrice.toFixed(2)}</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="radio" 
              name="purchaseType" 
              value="subscribe" 
              checked={subscriptionType === 'subscribe'}
              onChange={() => setSubscriptionType('subscribe')}
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Subscribe & Save</span>
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] py-0 border-none">Save 15%</Badge>
            </div>
            <span className="ml-auto text-sm font-medium">${(currentPrice * 0.85).toFixed(2)}</span>
          </label>
        </div>

        {subscriptionType === 'subscribe' && (
          <div className="mt-3 pl-7 animate-in fade-in slide-in-from-top-2">
            <Select value={subscriptionFrequency} onValueChange={setSubscriptionFrequency}>
              <SelectTrigger className="w-full h-9 text-sm bg-background">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Every 1 week</SelectItem>
                <SelectItem value="bi-weekly">Every 2 weeks</SelectItem>
                <SelectItem value="monthly">Every 1 month</SelectItem>
                <SelectItem value="quarterly">Every 3 months</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">Cancel anytime. Free shipping on subscription orders.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* C. Stock Indicator */}
        <div className="flex items-center gap-2 text-sm">
          {isOutOfStock ? (
            <Badge variant="outline" className="rounded-sm border-red-200 bg-red-50 text-red-600">Out of Stock</Badge>
          ) : stockQuantity <= 5 ? (
            <span className="text-amber-600 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Only {stockQuantity} left!
            </span>
          ) : (
            <span className="text-green-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              In Stock
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* D. Quantity Stepper */}
          <div className="flex items-center border border-input rounded-md h-12 w-32">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 flex items-center justify-center font-medium text-sm">
              {quantity}
            </div>
            <button 
              onClick={() => setQuantity(Math.min(stockQuantity || 99, quantity + 1))}
              disabled={quantity >= (stockQuantity || 99) || isOutOfStock}
              className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* E. Add to Cart button */}
          <Button 
            size="lg" 
            className="flex-1 h-12 text-base"
            disabled={isOutOfStock || isAddingToCart}
            onClick={handleAddToCart}
          >
            {isAddingToCart ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>

          {/* F. Add to Wishlist */}
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 flex-shrink-0"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("w-5 h-5 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-foreground")} />
          </Button>
        </div>
      </div>

      {/* H. Claim badges row */}
      {claims.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {claims.map((claim, idx) => (
            <Badge key={idx} variant="outline" className="bg-muted/50 text-muted-foreground font-normal hover:bg-muted/80 border-none">
              <CheckCircle2 className="w-3 h-3 mr-1.5 text-primary/70" />
              {claim.label}
            </Badge>
          ))}
        </div>
      )}

    </div>
  );
};
