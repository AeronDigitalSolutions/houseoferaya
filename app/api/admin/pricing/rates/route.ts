import { NextRequest, NextResponse } from "next/server";
import type { LockDuration, MetalId } from "@/components/admin/pricing/types";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";
import { fetchLiveMetalRates } from "@/lib/live-metal-rates";
import {
  type PersistedPricingRate,
  readPricingRatesStore,
  writePricingRatesStore
} from "@/lib/admin-pricing-rates-store";

const LOCK_DURATIONS: LockDuration[] = ["TODAY", "CUSTOM", "INDEFINITE"];
const METAL_IDS: MetalId[] = ["gold", "silver"];

function canViewPricing(admin: NonNullable<Awaited<ReturnType<typeof getAdminAuthFromRequest>>>) {
  return admin.role === "SUPER_ADMIN" || admin.permissions.canViewPricing || admin.permissions.canEditProducts;
}

function canEditPricing(admin: NonNullable<Awaited<ReturnType<typeof getAdminAuthFromRequest>>>) {
  return admin.role === "SUPER_ADMIN" || admin.permissions.canViewPricing;
}

function asNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function lockUntilForToday() {
  return new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
}

function maybeUnlockExpired(rate: PersistedPricingRate) {
  if (rate.status !== "LOCKED") return rate;
  if (!rate.lockedUntil) return rate;
  if (new Date(rate.lockedUntil).getTime() > Date.now()) return rate;
  return {
    ...rate,
    status: "UNLOCKED" as const,
    lockDuration: null,
    lockedRate: null,
    lockedFrom: null,
    lockedUntil: null,
    lockedBy: null,
    lastUpdated: new Date().toISOString()
  };
}

function applyLiveRates(
  rates: PersistedPricingRate[],
  live: Awaited<ReturnType<typeof fetchLiveMetalRates>>
) {
  return rates.map((rate) => {
    const liveRate = rate.id === "gold" ? live.rates.gold : live.rates.silver;
    const unlockedSelling = rate.status === "UNLOCKED" ? Number(liveRate.liveRatePerGram) : rate.sellingRate;
    const touched =
      rate.liveMarketRate !== Number(liveRate.liveRatePerGram) ||
      rate.liveFetchedAt !== liveRate.updatedAt ||
      rate.liveSource !== live.source ||
      (rate.status === "UNLOCKED" && unlockedSelling !== rate.sellingRate);

    if (!touched) return rate;
    return {
      ...rate,
      liveMarketRate: Number(liveRate.liveRatePerGram),
      liveFetchedAt: liveRate.updatedAt,
      liveSource: live.source,
      sellingRate: unlockedSelling,
      lastUpdated: rate.status === "UNLOCKED" ? new Date().toISOString() : rate.lastUpdated
    };
  });
}

async function buildCurrentRates() {
  let rates = await readPricingRatesStore();
  rates = rates.map(maybeUnlockExpired);

  try {
    const live = await fetchLiveMetalRates();
    const merged = applyLiveRates(rates, live);
    await writePricingRatesStore(merged);
    return { rates: merged, source: live.source, liveSync: "ok" as const };
  } catch (error) {
    await writePricingRatesStore(rates);
    return {
      rates,
      source: null,
      liveSync: "error" as const,
      message: error instanceof Error ? error.message : "Live rate sync failed."
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    if (!canViewPricing(admin)) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const payload = await buildCurrentRates();
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to load pricing rates." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    if (!canEditPricing(admin)) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body?.action || "").trim();
    const now = new Date().toISOString();
    const adminName = admin.name || admin.email || "Admin";

    let rates = await readPricingRatesStore();
    rates = rates.map(maybeUnlockExpired);

    if (action === "savePrice") {
      const id = String(body?.id || "").trim() as MetalId;
      const price = asNumber(body?.price);
      if (!METAL_IDS.includes(id) || !Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ success: false, message: "Invalid metal or price." }, { status: 400 });
      }
      rates = rates.map((rate) =>
        rate.id !== id
          ? rate
          : {
              ...rate,
              sellingRate: price,
              lockedRate: rate.status === "LOCKED" ? price : rate.lockedRate,
              lastUpdated: now
            }
      );
    } else if (action === "lock") {
      const id = String(body?.id || "").trim() as MetalId;
      const duration = String(body?.duration || "").trim() as LockDuration;
      const customUntilRaw = body?.customUntil ? String(body.customUntil) : null;
      if (!METAL_IDS.includes(id) || !LOCK_DURATIONS.includes(duration)) {
        return NextResponse.json({ success: false, message: "Invalid lock request." }, { status: 400 });
      }
      const customUntil =
        duration === "CUSTOM"
          ? customUntilRaw && Number.isFinite(new Date(customUntilRaw).getTime())
            ? new Date(customUntilRaw).toISOString()
            : null
          : null;
      if (duration === "CUSTOM" && !customUntil) {
        return NextResponse.json({ success: false, message: "Custom lock requires a valid datetime." }, { status: 400 });
      }

      rates = rates.map((rate) => {
        if (rate.id !== id) return rate;
        return {
          ...rate,
          status: "LOCKED",
          lockDuration: duration,
          lockedRate: rate.sellingRate,
          lockedFrom: now,
          lockedUntil: duration === "TODAY" ? lockUntilForToday() : duration === "INDEFINITE" ? null : customUntil,
          lockedBy: adminName,
          lastUpdated: now
        };
      });
    } else if (action === "unlock") {
      const id = String(body?.id || "").trim() as MetalId;
      if (!METAL_IDS.includes(id)) {
        return NextResponse.json({ success: false, message: "Invalid metal id." }, { status: 400 });
      }
      rates = rates.map((rate) =>
        rate.id !== id
          ? rate
          : {
              ...rate,
              status: "UNLOCKED",
              lockDuration: null,
              lockedRate: null,
              lockedFrom: null,
              lockedUntil: null,
              lockedBy: null,
              lastUpdated: now
            }
      );
    } else if (action === "lockAll") {
      rates = rates.map((rate) => ({
        ...rate,
        status: "LOCKED",
        lockDuration: "TODAY",
        lockedRate: rate.sellingRate,
        lockedFrom: now,
        lockedUntil: lockUntilForToday(),
        lockedBy: adminName,
        lastUpdated: now
      }));
    } else if (action === "unlockAll") {
      rates = rates.map((rate) => ({
        ...rate,
        status: "UNLOCKED",
        lockDuration: null,
        lockedRate: null,
        lockedFrom: null,
        lockedUntil: null,
        lockedBy: null,
        lastUpdated: now
      }));
    } else {
      return NextResponse.json({ success: false, message: "Unknown action." }, { status: 400 });
    }

    await writePricingRatesStore(rates);
    const payload = await buildCurrentRates();
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update pricing rates." },
      { status: 500 }
    );
  }
}

