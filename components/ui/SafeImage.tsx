"use client";

import { ImageOff } from "lucide-react";
import { type ImgHTMLAttributes, useEffect, useMemo, useState } from "react";
import { buildOptimizedImageUrl, estimateOptimizedImageWidth } from "@/lib/image-optimizer";

const DEFAULT_FALLBACK_SRC = "/assets/collection-aura.jpg";

type SafeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string | null;
  showMissingPlaceholder?: boolean;
};

export function SafeImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  onError,
  showMissingPlaceholder = false,
  className,
  loading = "lazy",
  decoding = "async",
  ...rest
}: SafeImageProps) {
  const normalizedFallback = useMemo(() => {
    if (fallbackSrc === null) return "";
    const value = String(fallbackSrc || "").trim();
    return value || DEFAULT_FALLBACK_SRC;
  }, [fallbackSrc]);

  const normalizedSource = useMemo(() => {
    const value = typeof src === "string" ? src.trim() : "";
    return value;
  }, [src]);

  const estimatedWidth = useMemo(() => {
    const candidateWidth =
      typeof rest.width === "number" && Number.isFinite(rest.width) && rest.width > 0
        ? rest.width
        : estimateOptimizedImageWidth(className, 1200);
    return candidateWidth;
  }, [className, rest.width]);

  const optimizedSource = useMemo(
    () => buildOptimizedImageUrl(normalizedSource || normalizedFallback, estimatedWidth, 70),
    [estimatedWidth, normalizedFallback, normalizedSource]
  );

  const [currentSrc, setCurrentSrc] = useState(optimizedSource);
  const [showPlaceholder, setShowPlaceholder] = useState(showMissingPlaceholder && !normalizedSource && !normalizedFallback);

  useEffect(() => {
    setCurrentSrc(optimizedSource);
    setShowPlaceholder(showMissingPlaceholder && !normalizedSource && !normalizedFallback);
  }, [optimizedSource, normalizedFallback, normalizedSource, showMissingPlaceholder]);

  if (showPlaceholder) {
    return (
      <div
        className={`flex items-center justify-center bg-stone-100 text-stone-400 ${className || ""}`}
        aria-label="Image unavailable"
      >
        <ImageOff className="h-8 w-8" />
      </div>
    );
  }

  return (
    <img
      {...rest}
      className={className}
      src={currentSrc}
      loading={loading}
      decoding={decoding}
      onError={(event) => {
        if (normalizedFallback && currentSrc !== buildOptimizedImageUrl(normalizedFallback, estimatedWidth, 70)) {
          setCurrentSrc(buildOptimizedImageUrl(normalizedFallback, estimatedWidth, 70));
        } else if (showMissingPlaceholder) {
          setShowPlaceholder(true);
        }
        onError?.(event);
      }}
    />
  );
}
