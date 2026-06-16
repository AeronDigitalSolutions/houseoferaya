import { publicUploadFileExists } from "@/lib/upload-storage";

export const DEFAULT_PRODUCT_IMAGE = "/assets/collection-aura.jpg";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
function normalizeImageUrl(value?: string | null) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const normalizedSlashes = trimmed.replace(/\\/g, "/");

  if (ABSOLUTE_URL_PATTERN.test(normalizedSlashes)) {
    return normalizedSlashes;
  }

  if (normalizedSlashes.startsWith("//")) {
    return `https:${normalizedSlashes}`;
  }

  const relative = normalizedSlashes.replace(/^\/+/, "");
  return `/${relative}`;
}
export async function resolveImageUrlWithFallback(
  rawUrl: string | null | undefined,
  fallback: string | null = DEFAULT_PRODUCT_IMAGE
) {
  const fallbackUrl = fallback === null ? "" : normalizeImageUrl(fallback) || DEFAULT_PRODUCT_IMAGE;
  const normalized = normalizeImageUrl(rawUrl);

  if (!normalized) {
    return fallbackUrl;
  }

  if (ABSOLUTE_URL_PATTERN.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/uploads/")) {
    const exists = await publicUploadFileExists(normalized);
    return exists ? normalized : fallbackUrl;
  }

  return normalized;
}
