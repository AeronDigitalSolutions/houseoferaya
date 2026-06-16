export function isSignatureProductSlug(slug?: string | null) {
  if (!slug) return false;
  return slug.startsWith("signature-");
}

export function getSignatureBadge(productName?: string) {
  if (!productName) return "Signature Piece";
  return `Signature Piece · ${productName}`;
}
