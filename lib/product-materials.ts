export const ARTIFICIAL_GST_PERCENTAGE = 18;

export const PRODUCT_BASE_METALS = ["GOLD", "SILVER", "ARTIFICIAL"] as const;
export type ProductBaseMetal = (typeof PRODUCT_BASE_METALS)[number];

export const PRODUCT_METAL_COLORS = [
  "YELLOW_GOLD",
  "ROSE_GOLD",
  "WHITE_GOLD",
  "OXIDISED_SILVER",
  "NOT_APPLICABLE"
] as const;
export type ProductMetalColor = (typeof PRODUCT_METAL_COLORS)[number];

export const PRODUCT_PURITY_TYPES = ["K24", "K22", "K18", "K14", "S925", "NOT_APPLICABLE"] as const;
export type ProductPurityType = (typeof PRODUCT_PURITY_TYPES)[number];

export const BASE_METAL_LABELS: Record<ProductBaseMetal, string> = {
  GOLD: "Gold",
  SILVER: "Silver",
  ARTIFICIAL: "Artificial"
};

export function isArtificialBaseMetal(baseMetal: string | null | undefined): baseMetal is "ARTIFICIAL" {
  return baseMetal === "ARTIFICIAL";
}

export function getBaseMetalLabel(baseMetal: string | null | undefined) {
  if (baseMetal === "SILVER") return BASE_METAL_LABELS.SILVER;
  if (baseMetal === "ARTIFICIAL") return BASE_METAL_LABELS.ARTIFICIAL;
  return BASE_METAL_LABELS.GOLD;
}

export function getAdminPurityLabel(baseMetal: string | null | undefined, purity: string | null | undefined) {
  if (isArtificialBaseMetal(baseMetal)) return "—";
  if (purity === "S925") return "925 Silver";
  return purity || "—";
}

export function getAdminWeightLabel(baseMetal: string | null | undefined, weightGrams: number | null | undefined) {
  if (isArtificialBaseMetal(baseMetal)) return "—";
  const safeWeight = Number(weightGrams);
  if (!Number.isFinite(safeWeight) || safeWeight <= 0) return "—";
  return `${safeWeight}g`;
}

export function getStorefrontWeight(product: {
  baseMetal: string | null | undefined;
  weight?: string | null;
  weightGrams?: number | string | { toString(): string } | null;
}) {
  if (isArtificialBaseMetal(product.baseMetal)) return null;
  if (product.weight) return product.weight;
  const numericWeight = Number(product.weightGrams);
  return Number.isFinite(numericWeight) && numericWeight > 0 ? `${numericWeight.toFixed(1)}g` : null;
}

export function getStorefrontGemstone(product: { baseMetal: string | null | undefined; gemstone?: string | null }) {
  if (isArtificialBaseMetal(product.baseMetal)) return null;
  return product.gemstone || null;
}
