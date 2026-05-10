"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw, UnlockKeyhole } from "lucide-react";
import { MetalRateCard } from "@/components/admin/pricing/MetalRateCard";
import { PricingSummaryCards } from "@/components/admin/pricing/PricingSummaryCards";
import { PricingRulesPanel } from "@/components/admin/pricing/PricingRulesPanel";
import { FormulaPreview } from "@/components/admin/pricing/FormulaPreview";
import { PriceActivityLog } from "@/components/admin/pricing/PriceActivityLog";
import type { ActivityLogItem, LockDuration, MetalId, MetalRate, PricingRules } from "@/components/admin/pricing/types";
import { formatCurrency } from "@/components/admin/pricing/utils";

type LiveRatesResponse = {
  success: boolean;
  source: string;
  currency: string;
  rates: {
    gold: {
      metal: string;
      symbol: "XAU";
      liveRatePerGram: number;
      unit: "gram";
      updatedAt: string;
    };
    silver: {
      metal: string;
      symbol: "XAG";
      liveRatePerGram: number;
      unit: "gram";
      updatedAt: string;
    };
  };
  message?: string;
};

// TODO: Replace defaults with backend-persisted selling rates when pricing settings API is ready.
const initialRates: MetalRate[] = [
  {
    id: "gold",
    name: "Gold",
    sellingRate: 9500,
    liveMarketRate: 9480,
    liveFetchedAt: new Date().toISOString(),
    liveSource: "gold-api.com",
    dayStartRate: 9425,
    unit: "₹ / gram",
    status: "LOCKED",
    lastUpdated: new Date().toISOString(),
    lockedRate: 9500,
    lockedFrom: new Date().toISOString(),
    lockedUntil: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
    lockedBy: "Admin",
    lockDuration: "TODAY"
  },
  {
    id: "silver",
    name: "Silver",
    sellingRate: 105,
    liveMarketRate: 104.2,
    liveFetchedAt: new Date().toISOString(),
    liveSource: "gold-api.com",
    dayStartRate: 106.2,
    unit: "₹ / gram",
    status: "UNLOCKED",
    lastUpdated: new Date().toISOString(),
    lockedRate: null,
    lockedFrom: null,
    lockedUntil: null,
    lockedBy: null,
    lockDuration: null
  }
];

const initialRules: PricingRules = {
  goldMakingChargeValue: 650,
  goldMakingChargeType: "PER_GRAM",
  silverMakingChargeValue: 9,
  silverMakingChargeType: "PER_GRAM",
  wastagePercentage: 5,
  gstPercentage: 3
};

const initialLogs: ActivityLogItem[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    metal: "Gold",
    oldRate: 9450,
    newRate: 9500,
    changeAmount: 50,
    action: "Price Edited",
    status: "Success",
    updatedBy: "Admin"
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    metal: "Gold",
    oldRate: 9500,
    newRate: 9500,
    changeAmount: 0,
    action: "Rate Locked",
    status: "Success",
    updatedBy: "Admin"
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    metal: "Silver",
    oldRate: 104,
    newRate: 105,
    changeAmount: 1,
    action: "Mock Rate Refreshed",
    status: "Info",
    updatedBy: "System Mock"
  }
];

export default function AdminPricingUpdatesPage() {
  const [rates, setRates] = useState<MetalRate[]>(initialRates);
  const [rules, setRules] = useState<PricingRules>(initialRules);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [logs, setLogs] = useState<ActivityLogItem[]>(initialLogs);
  const [isFetchingLive, setIsFetchingLive] = useState(false);

  const appendLogs = (entries: Omit<ActivityLogItem, "id" | "timestamp">[]) => {
    if (!entries.length) return;
    setLogs((prev) => [
      ...entries.map((entry) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        ...entry
      })),
      ...prev
    ]);
    // TODO: Persist activity logs to backend audit API.
  };

  const getMetalName = (id: MetalId) => (id === "gold" ? "Gold" : "Silver");

  const onSavePrice = (id: MetalId, price: number) => {
    const activity: Omit<ActivityLogItem, "id" | "timestamp">[] = [];
    setRates((prev) =>
      prev.map((rate) => {
        if (rate.id !== id) return rate;
        activity.push({
          metal: rate.name,
          oldRate: rate.sellingRate,
          newRate: price,
          changeAmount: price - rate.sellingRate,
          action: "Price Edited",
          status: "Success",
          updatedBy: "Admin"
        });
        return {
          ...rate,
          sellingRate: price,
          lockedRate: rate.status === "LOCKED" ? price : rate.lockedRate,
          lastUpdated: new Date().toISOString()
        };
      })
    );
    appendLogs(activity);
    setStatusMessage({ type: "success", text: `${getMetalName(id)} selling rate saved successfully.` });
  };

  const onLock = (id: MetalId, duration: LockDuration, customUntil: string | null) => {
    const now = new Date().toISOString();
    const activity: Omit<ActivityLogItem, "id" | "timestamp">[] = [];

    setRates((prev) =>
      prev.map((rate) => {
        if (rate.id !== id) return rate;
        const lockUntil =
          duration === "TODAY"
            ? new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
            : duration === "INDEFINITE"
              ? null
              : customUntil;

        activity.push({
          metal: rate.name,
          oldRate: rate.sellingRate,
          newRate: rate.sellingRate,
          changeAmount: 0,
          action: "Rate Locked",
          status: "Success",
          updatedBy: "Admin"
        });

        return {
          ...rate,
          status: "LOCKED",
          lockDuration: duration,
          lockedRate: rate.sellingRate,
          lockedFrom: now,
          lockedUntil: lockUntil,
          lockedBy: "Admin",
          lastUpdated: now
        };
      })
    );

    appendLogs(activity);
    setStatusMessage({ type: "success", text: `${getMetalName(id)} selling rate locked.` });
  };

  const onUnlock = (id: MetalId) => {
    const activity: Omit<ActivityLogItem, "id" | "timestamp">[] = [];
    setRates((prev) =>
      prev.map((rate) => {
        if (rate.id !== id) return rate;
        activity.push({
          metal: rate.name,
          oldRate: rate.sellingRate,
          newRate: rate.sellingRate,
          changeAmount: 0,
          action: "Rate Unlocked",
          status: "Success",
          updatedBy: "Admin"
        });
        return {
          ...rate,
          status: "UNLOCKED",
          lockDuration: null,
          lockedRate: null,
          lockedFrom: null,
          lockedUntil: null,
          lockedBy: null,
          lastUpdated: new Date().toISOString()
        };
      })
    );
    appendLogs(activity);
    setStatusMessage({ type: "success", text: `${getMetalName(id)} selling rate unlocked.` });
  };

  const lockAll = () => {
    const now = new Date().toISOString();
    const activity: Omit<ActivityLogItem, "id" | "timestamp">[] = [];

    setRates((prev) =>
      prev.map((rate) => {
        activity.push({
          metal: rate.name,
          oldRate: rate.sellingRate,
          newRate: rate.sellingRate,
          changeAmount: 0,
          action: "Rate Locked",
          status: "Success",
          updatedBy: "Admin"
        });
        return {
          ...rate,
          status: "LOCKED",
          lockDuration: "TODAY",
          lockedRate: rate.sellingRate,
          lockedFrom: now,
          lockedUntil: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
          lockedBy: "Admin",
          lastUpdated: now
        };
      })
    );

    appendLogs(activity);
    setStatusMessage({ type: "success", text: "All selling rates locked for today." });
  };

  const unlockAll = () => {
    const activity: Omit<ActivityLogItem, "id" | "timestamp">[] = [];

    setRates((prev) =>
      prev.map((rate) => {
        activity.push({
          metal: rate.name,
          oldRate: rate.sellingRate,
          newRate: rate.sellingRate,
          changeAmount: 0,
          action: "Rate Unlocked",
          status: "Success",
          updatedBy: "Admin"
        });
        return {
          ...rate,
          status: "UNLOCKED",
          lockDuration: null,
          lockedRate: null,
          lockedFrom: null,
          lockedUntil: null,
          lockedBy: null,
          lastUpdated: new Date().toISOString()
        };
      })
    );

    appendLogs(activity);
    setStatusMessage({ type: "info", text: "All selling rates unlocked." });
  };

  const fetchLiveRates = async () => {
    setIsFetchingLive(true);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/metal-rates/live", {
        method: "GET",
        cache: "no-store"
      });
      const payload = (await response.json()) as LiveRatesResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Live rate fetch failed.");
      }

      const liveByMetal: Record<MetalId, { rate: number; updatedAt: string }> = {
        gold: {
          rate: Number(payload.rates.gold.liveRatePerGram),
          updatedAt: payload.rates.gold.updatedAt
        },
        silver: {
          rate: Number(payload.rates.silver.liveRatePerGram),
          updatedAt: payload.rates.silver.updatedAt
        }
      };

      const activity: Omit<ActivityLogItem, "id" | "timestamp">[] = [];
      setRates((prev) =>
        prev.map((rate) => {
          const live = liveByMetal[rate.id];
          const oldSelling = rate.sellingRate;
          const nextSelling = rate.status === "UNLOCKED" ? live.rate : rate.sellingRate;

          activity.push({
            metal: rate.name,
            oldRate: oldSelling,
            newRate: nextSelling,
            changeAmount: nextSelling - oldSelling,
            action: "Live Rate Refreshed",
            status: "Info",
            updatedBy: "System Live"
          });

          return {
            ...rate,
            liveMarketRate: live.rate,
            liveFetchedAt: live.updatedAt,
            liveSource: payload.source,
            sellingRate: nextSelling,
            lockedRate: rate.status === "LOCKED" ? rate.lockedRate : null,
            lastUpdated: rate.status === "UNLOCKED" ? new Date().toISOString() : rate.lastUpdated
          };
        })
      );

      appendLogs(activity);
      setStatusMessage({
        type: "success",
        text: "Live market rates fetched from gold-api.com. Manual lock settings remain active."
      });
    } catch {
      setStatusMessage({
        type: "error",
        text: "Live rate fetch failed. Manual rates are still active."
      });
    } finally {
      setIsFetchingLive(false);
    }
  };

  const latestLiveFetchAt = useMemo(() => {
    const values = rates.map((rate) => rate.liveFetchedAt).filter(Boolean) as string[];
    if (!values.length) return "--";
    const maxMs = Math.max(...values.map((value) => new Date(value).getTime()));
    return Number.isFinite(maxMs) ? new Date(maxMs).toLocaleString("en-IN") : "--";
  }, [rates]);

  const lockedRateSnapshot = useMemo(() => {
    const gold = rates.find((item) => item.id === "gold");
    if (!gold) return "--";
    const value = gold.status === "LOCKED" && gold.lockedRate ? gold.lockedRate : gold.sellingRate;
    return `${formatCurrency(value)} / gram`;
  }, [rates]);

  return (
    <div className="space-y-10 pb-4">
      <section className="card rounded-3xl p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="font-heading text-3xl text-stone-900 sm:text-4xl">Pricing Updates / Metal Rates</h2>
            <p className="mt-2 text-sm text-stone-600">Manage daily gold and silver rates, lock selling rates, and track manual changes.</p>
            <p className="mt-1 text-xs text-stone-500">
              Live rates are indicative market rates. Final selling rates can be manually edited or locked by admin.
            </p>
            <p className="mt-1 text-xs text-stone-500">Last live fetch: {latestLiveFetchAt}</p>
          </div>

          <div className="pb-1">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
              <button
                type="button"
                onClick={lockAll}
                className="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-stone-800 lg:w-auto"
              >
                Lock All
              </button>
              <button
                type="button"
                onClick={unlockAll}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 transition hover:bg-rose-100 lg:w-auto"
              >
                <UnlockKeyhole size={13} />
                Unlock All
              </button>
              <button
                type="button"
                onClick={() => void fetchLiveRates()}
                disabled={isFetchingLive}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
              >
                {isFetchingLive ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                {isFetchingLive ? "Fetching Live Rates..." : "Refresh Live Rates"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setStatusMessage({
                    type: "info",
                    text: "Future support for Platinum and other metals will be added later."
                  })
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-stone-300 bg-white px-4 py-2 text-xs text-stone-700 transition hover:bg-stone-100 lg:w-auto"
              >
                <Plus size={13} />
                Add Future Metal
              </button>
            </div>
          </div>
        </div>
      </section>

      <PricingSummaryCards rates={rates} />

      <section className="card rounded-2xl p-4 sm:p-5 text-sm leading-7 text-stone-600">
        Rose Gold, White Gold, and Yellow Gold use the base Gold rate. They are color/alloy variants, not separate live metal rates.
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {rates.map((rate) => (
          <MetalRateCard key={rate.id} rate={rate} onSavePrice={onSavePrice} onLock={onLock} onUnlock={onUnlock} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <PricingRulesPanel rules={rules} onChange={setRules} />
        <FormulaPreview rates={rates} rules={rules} />
      </section>

      <section className="card rounded-3xl space-y-3 p-4 sm:p-6">
        <h3 className="font-heading text-2xl text-stone-900">Future Metal Support</h3>
        <p className="text-sm text-stone-600">Current focus is Gold and Silver. Expand when business goes live with additional metal lines.</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setStatusMessage({
                type: "info",
                text: "Future support for Platinum and other metals will be added later."
              })
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-stone-400 bg-stone-50 px-4 py-2 text-xs text-stone-700"
          >
            <Plus size={13} />
            + Add Metal
          </button>
          <p className="text-xs text-stone-500">Current active gold reference: {lockedRateSnapshot}</p>
        </div>
      </section>

      <PriceActivityLog logs={logs} />

      {statusMessage ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
            statusMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : statusMessage.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          {statusMessage.text}
        </p>
      ) : null}
    </div>
  );
}
