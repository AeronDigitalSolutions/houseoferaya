import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LockDuration, LockStatus, MetalId } from "@/components/admin/pricing/types";

export type PersistedPricingRate = {
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

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "admin-pricing-rates.json");

function todayLockEndIso() {
  return new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
}

function defaultRates(): PersistedPricingRate[] {
  const now = new Date().toISOString();
  return [
    {
      id: "gold",
      name: "Gold",
      sellingRate: 9500,
      liveMarketRate: null,
      liveFetchedAt: null,
      liveSource: null,
      dayStartRate: 9500,
      unit: "₹ / gram",
      status: "LOCKED",
      lastUpdated: now,
      lockedRate: 9500,
      lockedFrom: now,
      lockedUntil: todayLockEndIso(),
      lockedBy: "Admin",
      lockDuration: "TODAY"
    },
    {
      id: "silver",
      name: "Silver",
      sellingRate: 105,
      liveMarketRate: null,
      liveFetchedAt: null,
      liveSource: null,
      dayStartRate: 105,
      unit: "₹ / gram",
      status: "UNLOCKED",
      lastUpdated: now,
      lockedRate: null,
      lockedFrom: null,
      lockedUntil: null,
      lockedBy: null,
      lockDuration: null
    }
  ];
}

export async function readPricingRatesStore() {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as { rates?: PersistedPricingRate[] };
    if (Array.isArray(parsed?.rates) && parsed.rates.length === 2) {
      return parsed.rates;
    }
  } catch {
    // fall through to initialize defaults
  }

  const fallback = defaultRates();
  await writePricingRatesStore(fallback);
  return fallback;
}

export async function writePricingRatesStore(rates: PersistedPricingRate[]) {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(
    STORE_FILE,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        rates
      },
      null,
      2
    ),
    "utf8"
  );
}

