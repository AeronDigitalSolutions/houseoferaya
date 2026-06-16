export function isRingCategory(categorySlug?: string | null, categoryName?: string | null) {
  const normalizedSlug = String(categorySlug || "")
    .trim()
    .toLowerCase();
  const normalizedName = String(categoryName || "")
    .trim()
    .toLowerCase();

  return normalizedSlug === "rings" || normalizedSlug === "ring" || normalizedName === "rings" || normalizedName === "ring";
}
