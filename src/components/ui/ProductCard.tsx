import React from 'react';
import { RelatedProduct } from '@/src/types';

export const ProductCard = ({ product }: { product: RelatedProduct['product'] }) => {
  return (
    <div className="group relative flex flex-col gap-3 min-w-[200px] max-w-[240px] flex-shrink-0 cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
        <img 
          src={product.images[0]?.imageUrl} 
          alt={product.images[0]?.altText || product.name}
          width={480}
          height={600}
          loading="lazy"
          decoding="async"
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
        <p className="text-sm text-muted-foreground">${product.basePrice.toFixed(2)}</p>
      </div>
    </div>
  );
};
