import type { Prisma } from "@prisma/client";
import { calculateJewelryPrice, resolveProductMetalRate } from "@/lib/jewelry-pricing";

export const productPricingSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  compareAtPrice: true,
  sku: true,
  stock: true,
  metalType: true,
  gemstone: true,
  weight: true,
  certification: true,
  categoryId: true,
  isActive: true,
  baseMetal: true,
  metalColor: true,
  purity: true,
  purityFactor: true,
  weightGrams: true,
  activeGoldRate: true,
  activeSilverRate: true,
  useLockedRate: true,
  useManualSellingRate: true,
  manualSellingRate: true,
  makingChargeType: true,
  makingChargeValue: true,
  hasStone: true,
  stoneType: true,
  stoneCarat: true,
  stoneCostType: true,
  stoneCostValue: true,
  huidCharge: true,
  gstPercentage: true,
  images: {
    where: { isPrimary: true },
    orderBy: { sortOrder: "asc" as const },
    take: 1
  }
} satisfies Prisma.ProductSelect;

export type ProductWithPricing = Prisma.ProductGetPayload<{ select: typeof productPricingSelect }>;

const toNumber = (value: Prisma.Decimal | number | null | undefined) => (value == null ? 0 : Number(value));

export function buildProductPricing(product: ProductWithPricing) {
  const metalRate = resolveProductMetalRate({
    baseMetal: product.baseMetal,
    activeGoldRate: product.activeGoldRate ? Number(product.activeGoldRate) : null,
    activeSilverRate: product.activeSilverRate ? Number(product.activeSilverRate) : null,
    useManualSellingRate: product.useManualSellingRate,
    manualSellingRate: product.manualSellingRate ? Number(product.manualSellingRate) : null
  });

  const breakdown = calculateJewelryPrice({
    baseMetal: product.baseMetal,
    metalRate,
    weightGrams: toNumber(product.weightGrams),
    purityFactor: toNumber(product.purityFactor),
    makingChargeType: product.makingChargeType,
    makingChargeValue: toNumber(product.makingChargeValue),
    stoneCostType: product.stoneCostType,
    stoneCostValue: toNumber(product.stoneCostValue),
    stoneCarat: product.stoneCarat ? Number(product.stoneCarat) : 0,
    huidCharge: toNumber(product.huidCharge),
    gstPercentage: toNumber(product.gstPercentage)
  });

  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const cachedPrice = Number(product.price);
  const finalPrice = breakdown.finalPrice > 0 ? breakdown.finalPrice : cachedPrice;

  return {
    ...breakdown,
    metalRate,
    finalPrice,
    compareAtPrice
  };
}
