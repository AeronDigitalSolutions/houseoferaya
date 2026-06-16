const NEXT_ALLOWED_IMAGE_WIDTHS = [
  16,
  32,
  48,
  64,
  96,
  128,
  256,
  384,
  640,
  750,
  828,
  1080,
  1200,
  1920,
  2048,
  3840
];

const TAILWIND_SIZE_TO_PX: Record<string, number> = {
  "w-px": 1,
  "w-0.5": 2,
  "w-1": 4,
  "w-1.5": 6,
  "w-2": 8,
  "w-2.5": 10,
  "w-3": 12,
  "w-3.5": 14,
  "w-4": 16,
  "w-5": 20,
  "w-6": 24,
  "w-7": 28,
  "w-8": 32,
  "w-9": 36,
  "w-10": 40,
  "w-11": 44,
  "w-12": 48,
  "w-14": 56,
  "w-16": 64,
  "w-20": 80,
  "w-24": 96,
  "w-28": 112,
  "w-32": 128,
  "w-36": 144,
  "w-40": 160,
  "w-44": 176,
  "w-48": 192,
  "w-52": 208,
  "w-56": 224,
  "w-60": 240,
  "w-64": 256,
  "w-72": 288,
  "w-80": 320,
  "w-96": 384
};

function extractBracketedPixelValue(token: string) {
  const match = token.match(/^w-\[(\d+(?:\.\d+)?)px\]$/);
  if (match) return Number(match[1]);

  const heightMatch = token.match(/^h-\[(\d+(?:\.\d+)?)px\]$/);
  if (heightMatch) return Number(heightMatch[1]);

  return null;
}

function getClosestAllowedWidth(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 1200;
  let closest = NEXT_ALLOWED_IMAGE_WIDTHS[0];
  let bestDistance = Math.abs(closest - value);

  for (const candidate of NEXT_ALLOWED_IMAGE_WIDTHS) {
    const distance = Math.abs(candidate - value);
    if (distance < bestDistance) {
      closest = candidate;
      bestDistance = distance;
    }
  }

  return closest;
}

export function estimateOptimizedImageWidth(className?: string, fallbackWidth = 1200) {
  if (!className) return getClosestAllowedWidth(fallbackWidth);

  const tokens = className.split(/\s+/).filter(Boolean);
  let largest = 0;

  for (const token of tokens) {
    const bracketed = extractBracketedPixelValue(token);
    if (bracketed) {
      largest = Math.max(largest, bracketed);
      continue;
    }

    const mapped = TAILWIND_SIZE_TO_PX[token];
    if (mapped) {
      largest = Math.max(largest, mapped);
    }
  }

  if (!largest) {
    return getClosestAllowedWidth(fallbackWidth);
  }

  return getClosestAllowedWidth(largest);
}

export function buildOptimizedImageUrl(src: string, width: number, quality = 70) {
  const normalizedSrc = String(src || "").trim();
  if (!normalizedSrc) return normalizedSrc;

  if (
    normalizedSrc.startsWith("data:") ||
    normalizedSrc.startsWith("blob:") ||
    normalizedSrc.startsWith("/_next/image?")
  ) {
    return normalizedSrc;
  }

  const resolvedWidth = getClosestAllowedWidth(width);
  const safeQuality = Math.max(1, Math.min(100, Math.round(quality)));
  return `/_next/image?url=${encodeURIComponent(normalizedSrc)}&w=${resolvedWidth}&q=${safeQuality}`;
}
