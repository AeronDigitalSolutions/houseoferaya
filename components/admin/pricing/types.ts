export type MetalId = "gold" | "silver";

export type LockStatus = "LOCKED" | "UNLOCKED";
export type LockDuration = "TODAY" | "CUSTOM" | "INDEFINITE";

export type MetalRate = {
  id: MetalId;
  name: "Gold" | "Silver";
  sellingRate: number;
  liveMarketRate: number | null;
  liveFetchedAt: string | null;
  liveSource: string | null;
  dayStartRate: number;
  unit: "₹ / gram";
  status: LockStatus;
  lastUpdated: string;
  lockedRate: number | null;
  lockedFrom: string | null;
  lockedUntil: string | null;
  lockedBy: string | null;
  lockDuration: LockDuration | null;
};

export type PricingAction = "Price Edited" | "Rate Locked" | "Rate Unlocked" | "Mock Rate Refreshed" | "Live Rate Refreshed";

export type ActivityLogItem = {
  id: string;
  timestamp: string;
  metal: "Gold" | "Silver";
  oldRate: number;
  newRate: number;
  changeAmount: number;
  action: PricingAction;
  status: "Success" | "Info" | "Failed";
  updatedBy: string;
};

export type ChargeType = "PER_GRAM" | "PERCENT";

export type PricingRules = {
  goldMakingChargeValue: number;
  goldMakingChargeType: ChargeType;
  silverMakingChargeValue: number;
  silverMakingChargeType: ChargeType;
  wastagePercentage: number;
  gstPercentage: number;
};
