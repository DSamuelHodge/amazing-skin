import React from 'react';
import { cn } from '@/src/lib/utils';
import { ProductImage } from '@/src/types';

interface ImageGalleryProps {
  displayImages: ProductImage[];
  selectedImageIndex: number;
  setSelectedImageIndex: (idx: number) => void;
  productName: string;
}

export const ImageGallery = ({ displayImages, selectedImageIndex, setSelectedImageIndex, productName }: ImageGalleryProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-muted group">
        <img 
          src={displayImages[selectedImageIndex]?.imageUrl} 
          alt={displayImages[selectedImageIndex]?.altText || productName}
          width={1200}
          height={1500}
          fetchPriority="high"
          decoding="async"
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.8] origin-center cursor-zoom-in"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-md shadow-sm">
          {selectedImageIndex + 1} / {displayImages.length}
        </div>
      </div>
      
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {displayImages.map((img: any, idx: number) => (
            <button 
              key={img.id}
              onClick={() => setSelectedImageIndex(idx)}
              className={cn(
                "relative w-[72px] h-[72px] min-w-11 min-h-11 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all",
                selectedImageIndex === idx ? "border-primary" : "border-transparent hover:border-primary/50"
              )}
            >
              <img 
                src={img.imageUrl} 
                alt={img.altText || `${productName} thumbnail ${idx + 1}`}
                className="object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
