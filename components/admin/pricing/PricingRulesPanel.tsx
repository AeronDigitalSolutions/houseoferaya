"use client";

import { useState } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import type { PricingRules } from "@/components/admin/pricing/types";

type PricingRulesPanelProps = {
  rules: PricingRules;
  onChange: (next: PricingRules) => void;
};

export function PricingRulesPanel({ rules, onChange }: PricingRulesPanelProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const setField = <K extends keyof PricingRules>(field: K, value: PricingRules[K]) => {
    setMessage(null);
    onChange({ ...rules, [field]: value });
  };

  const saveRules = () => {
    const values = [rules.goldMakingChargeValue, rules.silverMakingChargeValue, rules.wastagePercentage, rules.gstPercentage];
    if (values.some((value) => !Number.isFinite(value) || value < 0)) {
      setMessage({ type: "error", text: "Please enter valid non-negative values in all rule fields." });
      return;
    }
    setMessage({ type: "success", text: "Pricing rules saved locally for preview." });
    // TODO: Persist pricing rules to backend settings API when available.
  };

  return (
    <section className="card rounded-3xl space-y-5 p-5 sm:p-7">
      <div>
        <h3 className="font-heading text-2xl text-stone-900">Pricing Rules</h3>
        <p className="mt-1 text-sm text-stone-600">These rules are placeholders for future product price calculation.</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="flex min-h-[2.4rem] items-end text-xs uppercase tracking-[0.16em] text-stone-500">
              Default Gold Making Charge
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rules.goldMakingChargeValue}
              onChange={(event) => setField("goldMakingChargeValue", Number(event.target.value))}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
            />
          </label>

          <label className="space-y-1.5">
            <span className="flex min-h-[2.4rem] items-end text-xs uppercase tracking-[0.16em] text-stone-500">Type</span>
            <CustomSelect
              value={rules.goldMakingChargeType}
              onValueChange={(value) =>
                setField("goldMakingChargeType", value as PricingRules["goldMakingChargeType"])
              }
              options={[
                { value: "PER_GRAM", label: "₹ / gram" },
                { value: "PERCENT", label: "%" }
              ]}
              buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
              menuClassName="w-full"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="flex min-h-[2.4rem] items-end text-xs uppercase tracking-[0.16em] text-stone-500">
              Default Silver Making Charge
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rules.silverMakingChargeValue}
              onChange={(event) => setField("silverMakingChargeValue", Number(event.target.value))}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
            />
          </label>

          <label className="space-y-1.5">
            <span className="flex min-h-[2.4rem] items-end text-xs uppercase tracking-[0.16em] text-stone-500">Type</span>
            <CustomSelect
              value={rules.silverMakingChargeType}
              onValueChange={(value) =>
                setField("silverMakingChargeType", value as PricingRules["silverMakingChargeType"])
              }
              options={[
                { value: "PER_GRAM", label: "₹ / gram" },
                { value: "PERCENT", label: "%" }
              ]}
              buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
              menuClassName="w-full"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Default Wastage %</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rules.wastagePercentage}
              onChange={(event) => setField("wastagePercentage", Number(event.target.value))}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">GST %</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rules.gstPercentage}
              onChange={(event) => setField("gstPercentage", Number(event.target.value))}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={saveRules}
          className="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-stone-800"
        >
          Save Rules
        </button>
      </div>

      {message ? (
        <p
          className={`rounded-xl border px-3 py-2 text-xs ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </section>
  );
}
