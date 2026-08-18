import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/src/components/ui/ProductCard';
import { RelatedProduct } from '@/src/types';

interface RelatedProductsProps {
  relatedGroups: Record<string, RelatedProduct[]>;
}

export const RelatedProducts = ({ relatedGroups }: RelatedProductsProps) => {
  if (Object.keys(relatedGroups).length === 0) return null;

  return (
    <div className="mt-24 mb-12">
      {Object.entries(relatedGroups).map(([relationshipType, products]: [string, any]) => (
        <div key={relationshipType} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-serif">{relationshipType}</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
            {products.slice(0, 6).map((rel: any) => (
              <div key={rel.relatedProductId} className="snap-start">
                <ProductCard product={rel.product} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
