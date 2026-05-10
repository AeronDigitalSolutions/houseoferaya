import type { MetalRate, PricingRules } from "@/components/admin/pricing/types";
import { formatCurrency } from "@/components/admin/pricing/utils";

type FormulaPreviewProps = {
  rates: MetalRate[];
  rules: PricingRules;
};

export function FormulaPreview({ rates, rules }: FormulaPreviewProps) {
  const gold = rates.find((item) => item.id === "gold");
  const activeGoldRate = gold?.status === "LOCKED" && gold.lockedRate ? gold.lockedRate : gold?.sellingRate || 0;

  const weight = 10;
  const stoneExtraCost = 3500;
  const metalValue = activeGoldRate * weight;

  const makingCharge =
    rules.goldMakingChargeType === "PER_GRAM"
      ? rules.goldMakingChargeValue * weight
      : (metalValue * rules.goldMakingChargeValue) / 100;

  const wastage = (metalValue * rules.wastagePercentage) / 100;
  const subtotal = metalValue + makingCharge + wastage + stoneExtraCost;
  const gstAmount = (subtotal * rules.gstPercentage) / 100;
  const estimatedTotal = subtotal + gstAmount;

  return (
    <section className="card rounded-3xl space-y-5 p-5 sm:p-7">
      <div>
        <h3 className="font-heading text-2xl text-stone-900">Formula Preview</h3>
        <p className="mt-1 text-sm text-stone-600">
          Final Product Price = (Metal Rate × Product Weight) + Making Charge + Wastage + Stone/Extra Cost + GST
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5">
        <p className="text-base font-medium text-stone-900">Example Gold Ring</p>
        <div className="mt-3 grid gap-2.5 text-sm text-stone-700 sm:grid-cols-2">
          <p>Weight: {weight}g</p>
          <p>Rate Used: {formatCurrency(activeGoldRate)} / gram</p>
          <p>Estimated metal value: {formatCurrency(metalValue)}</p>
          <p>Making charge: {formatCurrency(makingCharge)}</p>
          <p>Wastage: {formatCurrency(wastage)}</p>
          <p>Stone/Extra cost: {formatCurrency(stoneExtraCost)}</p>
          <p>GST: {formatCurrency(gstAmount)}</p>
          <p className="font-semibold text-stone-900">Estimated total: {formatCurrency(estimatedTotal)}</p>
        </div>
      </div>
    </section>
  );
}
