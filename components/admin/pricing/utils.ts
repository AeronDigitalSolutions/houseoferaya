import type { MetalRate } from "@/components/admin/pricing/types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDateTime(value: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("en-IN");
}

export function movementForRate(rate: Pick<MetalRate, "sellingRate" | "liveMarketRate" | "dayStartRate">) {
  const effectiveRate = rate.liveMarketRate ?? rate.sellingRate;
  const changeAmount = effectiveRate - rate.dayStartRate;
  const percentage = rate.dayStartRate ? (changeAmount / rate.dayStartRate) * 100 : 0;
  return { changeAmount, percentage };
}

export function lockDurationLabel(rate: Pick<MetalRate, "status" | "lockDuration" | "lockedUntil">) {
  if (rate.status === "UNLOCKED") return "Not locked";
  if (rate.lockDuration === "TODAY") return "Locked for today";
  if (rate.lockDuration === "INDEFINITE") return "Locked indefinitely";
  if (!rate.lockedUntil) return "Custom lock (date missing)";
  const date = new Date(rate.lockedUntil);
  return Number.isNaN(date.getTime()) ? "Custom lock (invalid date)" : `Locked until ${date.toLocaleString("en-IN")}`;
}

export function isValidPositiveAmountWithTwoDecimals(input: string) {
  if (!input.trim()) return false;
  if (!/^\d+(\.\d{1,2})?$/.test(input.trim())) return false;
  const numeric = Number(input);
  return Number.isFinite(numeric) && numeric > 0;
}
