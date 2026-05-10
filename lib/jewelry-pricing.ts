export const PURITY_FACTOR_MAP = {
  K24: 1,
  K22: 0.916,
  K18: 0.75,
  K14: 0.585,
  S925: 0.925
} as const;

export type BaseMetalValue = "GOLD" | "SILVER";
export type MakingChargeTypeValue = "PER_GRAM" | "FIXED" | "PERCENTAGE";
export type StoneCostTypeValue = "FIXED" | "PER_CARAT";

type CalculateJewelryPriceInput = {
  baseMetal: BaseMetalValue;
  metalRate: number;
  weightGrams: number;
  purityFactor: number;
  makingChargeType: MakingChargeTypeValue;
  makingChargeValue: number;
  stoneCostType: StoneCostTypeValue;
  stoneCostValue: number;
  stoneCarat?: number | null;
  huidCharge: number;
  gstPercentage: number;
};

type CalculateJewelryPriceOutput = {
  metalPrice: number;
  makingCharge: number;
  stoneCost: number;
  huidCharge: number;
  subtotalBeforeGst: number;
  gstAmount: number;
  finalPrice: number;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

export function calculateJewelryPrice({
  metalRate,
  weightGrams,
  purityFactor,
  makingChargeType,
  makingChargeValue,
  stoneCostType,
  stoneCostValue,
  stoneCarat,
  huidCharge,
  gstPercentage
}: CalculateJewelryPriceInput): CalculateJewelryPriceOutput {
  const safeMetalRate = Number.isFinite(metalRate) && metalRate > 0 ? metalRate : 0;
  const safeWeight = Number.isFinite(weightGrams) && weightGrams > 0 ? weightGrams : 0;
  const safePurity = Number.isFinite(purityFactor) && purityFactor > 0 ? purityFactor : 0;
  const safeMakingValue = Number.isFinite(makingChargeValue) && makingChargeValue > 0 ? makingChargeValue : 0;
  const safeStoneCostValue = Number.isFinite(stoneCostValue) && stoneCostValue > 0 ? stoneCostValue : 0;
  const safeStoneCarat = Number.isFinite(stoneCarat ?? NaN) && (stoneCarat ?? 0) > 0 ? Number(stoneCarat) : 0;
  const safeHuidCharge = Number.isFinite(huidCharge) && huidCharge > 0 ? huidCharge : 0;
  const safeGst = Number.isFinite(gstPercentage) && gstPercentage > 0 ? gstPercentage : 0;

  const metalPrice = safeMetalRate * safeWeight * safePurity;

  let makingCharge = 0;
  if (makingChargeType === "PER_GRAM") {
    makingCharge = safeMakingValue * safeWeight;
  } else if (makingChargeType === "PERCENTAGE") {
    makingCharge = (metalPrice * safeMakingValue) / 100;
  } else {
    makingCharge = safeMakingValue;
  }

  const stoneCost =
    stoneCostType === "PER_CARAT" ? safeStoneCostValue * safeStoneCarat : safeStoneCostValue;

  const subtotalBeforeGst = metalPrice + makingCharge + stoneCost + safeHuidCharge;
  const gstAmount = (subtotalBeforeGst * safeGst) / 100;
  const finalPrice = subtotalBeforeGst + gstAmount;

  return {
    metalPrice: round2(metalPrice),
    makingCharge: round2(makingCharge),
    stoneCost: round2(stoneCost),
    huidCharge: round2(safeHuidCharge),
    subtotalBeforeGst: round2(subtotalBeforeGst),
    gstAmount: round2(gstAmount),
    finalPrice: round2(finalPrice)
  };
}

type RateSelectionInput = {
  baseMetal: BaseMetalValue;
  activeGoldRate: number | null;
  activeSilverRate: number | null;
  useManualSellingRate: boolean;
  manualSellingRate: number | null;
};

export function resolveProductMetalRate(input: RateSelectionInput) {
  const marketRate = input.baseMetal === "GOLD" ? input.activeGoldRate : input.activeSilverRate;
  if (input.useManualSellingRate && input.manualSellingRate && input.manualSellingRate > 0) {
    return input.manualSellingRate;
  }
  return marketRate && marketRate > 0 ? marketRate : 0;
}
