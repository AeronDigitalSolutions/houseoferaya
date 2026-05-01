"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type ProductImageGalleryProps = {
  productName: string;
  images: string[];
};

export function ProductImageGallery({ productName, images }: ProductImageGalleryProps) {
  const uniqueImages = useMemo(() => Array.from(new Set(images)).filter(Boolean), [images]);
  const safeImages = uniqueImages.length ? uniqueImages : ["/assets/signature-ring.jpg"];

  const [activeIndex, setActiveIndex] = useState(0);
  const mobileStripRef = useRef<HTMLDivElement | null>(null);

  const scrollThumbs = (direction: "left" | "right") => {
    if (!mobileStripRef.current) return;
    const delta = direction === "left" ? -220 : 220;
    mobileStripRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  const onThumbClick = (idx: number) => {
    setActiveIndex(idx);
  };

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-2xl bg-stone-100">
        <img src={safeImages[activeIndex]} alt={productName} className="h-full w-full object-cover" />
      </div>

      <div className="relative md:hidden">
        <div ref={mobileStripRef} className="flex snap-x gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {safeImages.map((image, imageIndex) => (
            <button
              key={`${image}-${imageIndex}`}
              type="button"
              onClick={() => onThumbClick(imageIndex)}
              className={`min-w-[42%] snap-start rounded-xl border bg-white p-2 transition ${
                imageIndex === activeIndex ? "border-stone-800 shadow-sm" : "border-stone-200"
              }`}
              aria-label={`View image ${imageIndex + 1}`}
            >
              <div className="aspect-square overflow-hidden rounded-lg">
                <img src={image} alt={`${productName} view ${imageIndex + 1}`} className="h-full w-full object-cover" />
              </div>
            </button>
          ))}
        </div>

        {safeImages.length > 2 ? (
          <>
            <button
              type="button"
              onClick={() => scrollThumbs("left")}
              className="absolute -left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-300 bg-white/95 p-2 text-stone-700 shadow-sm"
              aria-label="Scroll product images left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollThumbs("right")}
              className="absolute -right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-300 bg-white/95 p-2 text-stone-700 shadow-sm"
              aria-label="Scroll product images right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>

      <div className="hidden grid-cols-2 gap-3 sm:grid md:grid-cols-3">
        {safeImages.slice(0, 3).map((image, imageIndex) => (
          <button
            key={`${image}-desktop-${imageIndex}`}
            type="button"
            onClick={() => onThumbClick(imageIndex)}
            className={`aspect-square rounded-xl border bg-white p-2 transition ${
              imageIndex === activeIndex ? "border-stone-800 shadow-sm" : "border-stone-200"
            }`}
            aria-label={`View image ${imageIndex + 1}`}
          >
            <img src={image} alt={`${productName} view ${imageIndex + 1}`} className="h-full w-full rounded-lg object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

