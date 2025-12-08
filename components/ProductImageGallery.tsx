'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Type declaration for model-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

interface ProductImage {
  id: string;
  url: string;
  order: number;
}

interface ProductImageGalleryProps {
  heroImage: string;
  images: ProductImage[];
  title: string;
}

export function ProductImageGallery({ heroImage, images, title }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use only product images (no hero image)
  const allImages = images.map(img => img.url);
  const currentImage = allImages[currentImageIndex];

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Don't render anything if there are no images
  if (allImages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Main Image Display */}
      <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image 
          src={currentImage} 
          alt={title} 
          fill 
          className="object-contain" 
          priority
        />
        
        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {/* Product images thumbnails */}
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => handleThumbnailClick(index)}
              className={`relative h-20 rounded-lg overflow-hidden transition-all ${
                currentImageIndex === index
                  ? 'ring-2 ring-brand'
                  : 'ring-1 ring-slate-300 dark:ring-slate-700 hover:ring-slate-400 dark:hover:ring-slate-600'
              }`}
            >
              <Image src={img.url} alt={`${title} image ${index + 1}`} fill className="object-contain" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
