export const SIGNATURE_PRODUCT_SLUGS = [
  "celeste-diamond-ring",
  "luna-halo-ring",
  "astra-pendant-necklace"
] as const;

const signatureSlugSet = new Set<string>(SIGNATURE_PRODUCT_SLUGS);

export function isSignatureProductSlug(slug?: string | null) {
  if (!slug) return false;
  return signatureSlugSet.has(slug) || slug.startsWith("signature-");
}

export function getSignatureBadge(productName?: string) {
  if (!productName) return "Signature Piece";
  return `Signature Piece · ${productName}`;
}
