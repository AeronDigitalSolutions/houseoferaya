"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";

type ProductImageGalleryProps = {
  productName: string;
  images: string[];
};

export function ProductImageGallery({ productName, images }: ProductImageGalleryProps) {
  const uniqueImages = useMemo(() => Array.from(new Set(images)).filter(Boolean), [images]);
  const safeImages = uniqueImages.length ? uniqueImages : ["/assets/signature-ring.jpg"];

  const [activeIndex, setActiveIndex] = useState(0);
  const [showZoomPreview, setShowZoomPreview] = useState(false);
  const [zoomPoint, setZoomPoint] = useState({ x: 50, y: 50 });
  const [mobileCanScroll, setMobileCanScroll] = useState(false);
  const [desktopCanScroll, setDesktopCanScroll] = useState(false);
  const mainImageRef = useRef<HTMLDivElement | null>(null);
  const mobileStripRef = useRef<HTMLDivElement | null>(null);
  const desktopStripRef = useRef<HTMLDivElement | null>(null);

  const updateScrollState = useCallback(() => {
    const mobileEl = mobileStripRef.current;
    const desktopEl = desktopStripRef.current;
    setMobileCanScroll(Boolean(mobileEl && mobileEl.scrollWidth > mobileEl.clientWidth + 1));
    setDesktopCanScroll(Boolean(desktopEl && desktopEl.scrollWidth > desktopEl.clientWidth + 1));
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [safeImages, updateScrollState]);

  useEffect(() => {
    if (activeIndex >= safeImages.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, safeImages.length]);

  const scrollThumbs = (direction: "left" | "right", target: "mobile" | "desktop") => {
    const rail = target === "mobile" ? mobileStripRef.current : desktopStripRef.current;
    if (!rail) return;
    const delta = direction === "left" ? -220 : 220;
    rail.scrollBy({ left: delta, behavior: "smooth" });
  };

  const onThumbnailRailWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.currentTarget.scrollBy({ left: event.deltaY, behavior: "auto" });
    event.preventDefault();
  };

  const onThumbClick = (idx: number) => {
    setActiveIndex(idx);
  };

  const onMainImageMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPoint({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={mainImageRef}
          className="aspect-square overflow-hidden rounded-2xl bg-stone-100 lg:cursor-zoom-in"
          onMouseEnter={() => setShowZoomPreview(true)}
          onMouseLeave={() => setShowZoomPreview(false)}
          onMouseMove={onMainImageMove}
        >
          <SafeImage
            src={safeImages[activeIndex]}
            alt={productName}
            fallbackSrc="/assets/signature-ring.jpg"
            className="h-full w-full object-cover"
          />
        </div>
        {showZoomPreview ? (
          <div className="pointer-events-none absolute left-full top-1/2 z-20 ml-6 hidden h-[500px] w-[500px] -translate-y-1/2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl lg:block xl:h-[560px] xl:w-[560px]">
            <SafeImage
              src={safeImages[activeIndex]}
              alt={`${productName} zoom preview`}
              fallbackSrc="/assets/signature-ring.jpg"
              className="h-full w-full object-cover"
              style={{
                transform: "scale(3)",
                transformOrigin: `${zoomPoint.x}% ${zoomPoint.y}%`
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="relative md:hidden">
        <div
          ref={mobileStripRef}
          onWheel={onThumbnailRailWheel}
          className="flex snap-x gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
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
                <SafeImage
                  src={image}
                  alt={`${productName} view ${imageIndex + 1}`}
                  fallbackSrc="/assets/signature-ring.jpg"
                  className="h-full w-full object-cover"
                />
              </div>
            </button>
          ))}
        </div>

        {mobileCanScroll ? (
          <>
            <button
              type="button"
              onClick={() => scrollThumbs("left", "mobile")}
              className="absolute -left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-300 bg-white/95 p-2 text-stone-700 shadow-sm"
              aria-label="Scroll product images left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollThumbs("right", "mobile")}
              className="absolute -right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-300 bg-white/95 p-2 text-stone-700 shadow-sm"
              aria-label="Scroll product images right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>

      <div className="relative hidden md:block">
        <div
          ref={desktopStripRef}
          onWheel={onThumbnailRailWheel}
          className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]"
        >
          {safeImages.map((image, imageIndex) => (
            <button
              key={`${image}-desktop-${imageIndex}`}
              type="button"
              onClick={() => onThumbClick(imageIndex)}
              className={`aspect-square w-[132px] shrink-0 rounded-xl border bg-white p-2 transition lg:w-[140px] ${
                imageIndex === activeIndex ? "border-stone-800 shadow-sm" : "border-stone-200"
              }`}
              aria-label={`View image ${imageIndex + 1}`}
            >
              <SafeImage
                src={image}
                alt={`${productName} view ${imageIndex + 1}`}
                fallbackSrc="/assets/signature-ring.jpg"
                className="h-full w-full rounded-lg object-cover"
              />
            </button>
          ))}
        </div>

        {desktopCanScroll ? (
          <>
            <button
              type="button"
              onClick={() => scrollThumbs("left", "desktop")}
              className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-300 bg-white/95 p-2 text-stone-700 shadow-sm"
              aria-label="Scroll product images left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollThumbs("right", "desktop")}
              className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-300 bg-white/95 p-2 text-stone-700 shadow-sm"
              aria-label="Scroll product images right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
