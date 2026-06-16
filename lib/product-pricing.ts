import type { Prisma } from "@prisma/client";
import { calculateJewelryPrice, resolveProductMetalRate } from "@/lib/jewelry-pricing";
import { ARTIFICIAL_GST_PERCENTAGE, isArtificialBaseMetal } from "@/lib/product-materials";

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
const round2 = (value: number) => Math.round(value * 100) / 100;

export function buildProductPricing(product: ProductWithPricing) {
  if (isArtificialBaseMetal(product.baseMetal)) {
    const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
    const finalPrice = Number(product.price) > 0 ? Number(product.price) : 0;
    const gstPercentage = toNumber(product.gstPercentage) > 0 ? toNumber(product.gstPercentage) : ARTIFICIAL_GST_PERCENTAGE;
    const subtotalBeforeGst = gstPercentage > 0 ? round2(finalPrice / (1 + gstPercentage / 100)) : finalPrice;
    const gstAmount = round2(finalPrice - subtotalBeforeGst);

    return {
      metalRate: 0,
      metalPrice: 0,
      makingCharge: 0,
      stoneCost: 0,
      huidCharge: 0,
      subtotalBeforeGst,
      gstAmount,
      finalPrice,
      compareAtPrice
    };
  }

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
  const finalPrice = cachedPrice > 0 ? cachedPrice : breakdown.finalPrice;

  return {
    ...breakdown,
    metalRate,
    finalPrice,
    compareAtPrice
  };
}
