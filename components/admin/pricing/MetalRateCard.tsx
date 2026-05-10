"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, ChevronDown, CircleDollarSign, Coins, Lock, LockKeyhole, LockOpen, PencilLine, Save, X } from "lucide-react";
import type { LockDuration, MetalId, MetalRate } from "@/components/admin/pricing/types";
import { formatCurrency, formatDateTime, isValidPositiveAmountWithTwoDecimals, lockDurationLabel, movementForRate } from "@/components/admin/pricing/utils";

type MetalRateCardProps = {
  rate: MetalRate;
  onSavePrice: (id: MetalId, price: number) => void;
  onLock: (id: MetalId, duration: LockDuration, customUntil: string | null) => void;
  onUnlock: (id: MetalId) => void;
};

const LOCK_DURATION_OPTIONS: { value: LockDuration; label: string; description: string }[] = [
  { value: "TODAY", label: "Lock for today", description: "Auto unlocks at end of day." },
  { value: "CUSTOM", label: "Lock until custom date/time", description: "Set a specific unlock date and time." },
  { value: "INDEFINITE", label: "Lock indefinitely", description: "Keeps locked until manually unlocked." }
];

const pad2 = (value: number) => String(value).padStart(2, "0");

function buildCustomLockDateTime(
  dateText: string,
  hourText: string,
  minuteText: string,
  period: "AM" | "PM"
) {
  const dateMatch = dateText.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!dateMatch) return null;

  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return null;
  if (month < 1 || month > 12) return null;
  if (year < 2000 || year > 2100) return null;
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) return null;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;

  const maxDay = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDay) return null;

  const hour24 = period === "PM" ? (hour % 12) + 12 : hour % 12;
  const localDate = new Date(year, month - 1, day, hour24, minute, 0, 0);
  if (Number.isNaN(localDate.getTime())) return null;

  return localDate;
}

function recommendationFor(rate: MetalRate) {
  const { changeAmount, percentage } = movementForRate(rate);
  if (Math.abs(percentage) < 0.05) return `${rate.name} is stable — safe to keep unlocked.`;
  if (changeAmount > 0 && rate.status === "UNLOCKED") return `${rate.name} increased today — consider locking rate.`;
  if (changeAmount < 0 && rate.status === "LOCKED") return `${rate.name} softened today — locked rate is protecting margin.`;
  if (changeAmount < 0 && rate.status === "UNLOCKED") return `${rate.name} dipped today — you can keep it flexible.`;
  return `${rate.name} rate is actively managed.`;
}

export function MetalRateCard({ rate, onSavePrice, onLock, onUnlock }: MetalRateCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLockPanelOpen, setIsLockPanelOpen] = useState(false);
  const [isUnlockConfirmOpen, setIsUnlockConfirmOpen] = useState(false);
  const [isLockDurationMenuOpen, setIsLockDurationMenuOpen] = useState(false);
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [draftPrice, setDraftPrice] = useState(String(rate.sellingRate));
  const [lockDuration, setLockDuration] = useState<LockDuration>("TODAY");
  const [customDate, setCustomDate] = useState("");
  const [customHour, setCustomHour] = useState("");
  const [customMinute, setCustomMinute] = useState("");
  const [customPeriod, setCustomPeriod] = useState<"AM" | "PM">("PM");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const lockDurationMenuRef = useRef<HTMLDivElement | null>(null);
  const periodMenuRef = useRef<HTMLDivElement | null>(null);

  const Icon = rate.id === "gold" ? Coins : CircleDollarSign;
  const movement = useMemo(() => movementForRate(rate), [rate]);
  const lockLabel = lockDurationLabel(rate);

  const liveRate = rate.liveMarketRate;
  const difference = liveRate === null ? null : Number((rate.sellingRate - liveRate).toFixed(2));
  const showPrimaryActions = !isEditing && !isLockPanelOpen && !isUnlockConfirmOpen;

  const savePrice = () => {
    if (!isValidPositiveAmountWithTwoDecimals(draftPrice)) {
      setMessage({ type: "error", text: "Enter a valid positive price (max 2 decimals)." });
      return;
    }

    onSavePrice(rate.id, Number(draftPrice));
    setMessage({ type: "success", text: "Selling rate saved." });
    setIsEditing(false);
  };

  const customDatePreview = useMemo(() => {
    if (lockDuration !== "CUSTOM") return null;
    const parsed = buildCustomLockDateTime(customDate, customHour, customMinute, customPeriod);
    if (!parsed) return null;
    return parsed;
  }, [customDate, customHour, customMinute, customPeriod, lockDuration]);

  const applyLock = () => {
    if (lockDuration === "CUSTOM") {
      const parsedDate = buildCustomLockDateTime(customDate, customHour, customMinute, customPeriod);
      if (!parsedDate) {
        setMessage({ type: "error", text: "Enter valid custom date and time (DD/MM/YYYY, HH, MM)." });
        return;
      }
      if (parsedDate.getTime() <= Date.now()) {
        setMessage({ type: "error", text: "Custom lock time must be in the future." });
        return;
      }
      onLock(rate.id, lockDuration, parsedDate.toISOString());
    } else {
      onLock(rate.id, lockDuration, null);
    }

    setMessage({ type: "success", text: "Selling rate locked successfully." });
    setIsLockPanelOpen(false);
    setIsLockDurationMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (lockDurationMenuRef.current && !lockDurationMenuRef.current.contains(target)) {
        setIsLockDurationMenuOpen(false);
      }
      if (periodMenuRef.current && !periodMenuRef.current.contains(target)) {
        setIsPeriodMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <article className="card rounded-3xl space-y-6 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-stone-500">
            <Icon size={14} />
            {rate.name}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-stone-500">Live Market Rate</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900 sm:text-[2rem]">
            {liveRate === null ? "--" : formatCurrency(liveRate)}
          </p>
          <p className="text-xs text-stone-500">{rate.unit}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-stone-500">Selling Rate</p>
          <p className="mt-1 text-3xl font-semibold leading-tight text-stone-900 sm:text-[2.6rem]">
            {formatCurrency(rate.sellingRate)}
          </p>
          <p className="text-xs text-stone-500">{rate.unit}</p>
          <p className="mt-3 text-xs text-stone-500">Last updated: {formatDateTime(rate.lastUpdated)}</p>
          <p className="mt-1 text-xs text-stone-500">
            Last fetched: {formatDateTime(rate.liveFetchedAt)} • Source: {rate.liveSource || "--"}
          </p>
        </div>

        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            rate.status === "LOCKED"
              ? "border border-emerald-200 bg-emerald-100 text-emerald-800"
              : "border border-amber-200 bg-amber-100 text-amber-800"
          }`}
        >
          {rate.status === "LOCKED" ? "Locked" : "Unlocked"}
        </span>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-stone-600">Today Change</p>
          <p className={movement.changeAmount > 0 ? "text-emerald-700" : movement.changeAmount < 0 ? "text-rose-700" : "text-stone-700"}>
            {movement.changeAmount > 0 ? "+" : ""}
            {formatCurrency(movement.changeAmount)} ({movement.percentage > 0 ? "+" : ""}
            {movement.percentage.toFixed(2)}%)
          </p>
        </div>
        <p className="mt-2 text-sm text-stone-600">{recommendationFor(rate)}</p>
        <p className="mt-3 text-xs text-stone-500">
          Selling vs Live Difference:{" "}
          {difference === null ? "--" : `${difference > 0 ? "+" : ""}${formatCurrency(difference)}`}
        </p>
      </div>

      {rate.status === "LOCKED" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
          <div className="grid gap-2 text-sm text-emerald-800 sm:grid-cols-2">
            <p>Locked rate: {formatCurrency(rate.lockedRate || rate.sellingRate)}</p>
            <p>Locked from: {formatDateTime(rate.lockedFrom)}</p>
            <p>Locked until: {lockLabel}</p>
            <p>Locked by: {rate.lockedBy || "Admin"}</p>
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <label className="space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Edit Selling Rate</span>
            <input
              value={draftPrice}
              onChange={(event) => setDraftPrice(event.target.value)}
              inputMode="decimal"
              placeholder="Enter price"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
            />
          </label>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={savePrice}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-stone-800"
            >
              <Save size={13} />
              Save Price
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftPrice(String(rate.sellingRate));
                setIsEditing(false);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs text-stone-700 transition hover:bg-stone-100"
            >
              <X size={13} />
              Cancel Edit
            </button>
          </div>
        </div>
      ) : null}

      {isLockPanelOpen ? (
        <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Lock Duration</span>
            <div className="relative" ref={lockDurationMenuRef}>
              <button
                type="button"
                onClick={() => setIsLockDurationMenuOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-left text-sm text-stone-800 outline-none transition hover:border-stone-400"
              >
                <span>{LOCK_DURATION_OPTIONS.find((item) => item.value === lockDuration)?.label}</span>
                <ChevronDown size={16} className={`transition ${isLockDurationMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isLockDurationMenuOpen ? (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                  {LOCK_DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setLockDuration(option.value);
                        setIsLockDurationMenuOpen(false);
                      }}
                      className={`w-full border-b border-stone-100 px-3 py-2.5 text-left transition last:border-b-0 ${
                        option.value === lockDuration ? "bg-stone-100 text-stone-900" : "hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <p className="text-sm">{option.label}</p>
                      <p className="text-xs text-stone-500">{option.description}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {lockDuration === "CUSTOM" ? (
            <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
              <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-stone-500">
                <CalendarClock size={13} />
                Custom Until
              </p>
              <label className="space-y-1">
                <span className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Date (DD/MM/YYYY)</span>
                <input
                  type="text"
                  value={customDate}
                  onChange={(event) => setCustomDate(event.target.value)}
                  placeholder="07/05/2026"
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1">
                  <span className="flex min-h-[2rem] items-end text-[11px] uppercase tracking-[0.14em] text-stone-500">
                    Hour (1-12)
                  </span>
                  <input
                    type="text"
                    value={customHour}
                    onChange={(event) => setCustomHour(event.target.value.replace(/\D/g, "").slice(0, 2))}
                    placeholder="09"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
                  />
                </label>
                <label className="space-y-1">
                  <span className="flex min-h-[2rem] items-end text-[11px] uppercase tracking-[0.14em] text-stone-500">
                    Minute (00-59)
                  </span>
                  <input
                    type="text"
                    value={customMinute}
                    onChange={(event) => setCustomMinute(event.target.value.replace(/\D/g, "").slice(0, 2))}
                    placeholder="30"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
                  />
                </label>
                <div className="space-y-1">
                  <span className="flex min-h-[2rem] items-end text-[11px] uppercase tracking-[0.14em] text-stone-500">Period</span>
                  <div className="relative" ref={periodMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsPeriodMenuOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-left text-sm text-stone-800 transition hover:border-stone-400"
                    >
                      <span>{customPeriod}</span>
                      <ChevronDown size={16} className={`transition ${isPeriodMenuOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isPeriodMenuOpen ? (
                      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                        {(["AM", "PM"] as const).map((period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => {
                              setCustomPeriod(period);
                              setIsPeriodMenuOpen(false);
                            }}
                            className={`w-full border-b border-stone-100 px-3 py-2 text-left text-sm last:border-b-0 ${
                              customPeriod === period ? "bg-stone-100 text-stone-900" : "text-stone-700 hover:bg-stone-50"
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-500">
                {customDatePreview
                  ? `Unlock preview: ${pad2(customDatePreview.getDate())}/${pad2(customDatePreview.getMonth() + 1)}/${customDatePreview.getFullYear()} ${customDatePreview.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true
                    })}`
                  : "Enter date and time to preview unlock moment."}
              </p>
            </div>
          ) : null}

          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={applyLock}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-stone-800"
            >
              <Lock size={13} />
              Confirm Lock
            </button>
            <button
              type="button"
              onClick={() => setIsLockPanelOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs text-stone-700 transition hover:bg-stone-100"
            >
              <X size={13} />
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {isUnlockConfirmOpen ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-sm text-rose-700">Unlock this rate now?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onUnlock(rate.id);
                setMessage({ type: "success", text: "Rate unlocked." });
                setIsUnlockConfirmOpen(false);
              }}
              className="rounded-full bg-rose-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-rose-700"
            >
              Yes, Unlock
            </button>
            <button
              type="button"
              onClick={() => setIsUnlockConfirmOpen(false)}
              className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs text-rose-700 transition hover:bg-rose-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {showPrimaryActions ? (
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setIsEditing(true);
            setIsLockPanelOpen(false);
            setIsUnlockConfirmOpen(false);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs text-stone-800 transition hover:bg-stone-100"
        >
          <PencilLine size={13} />
          Edit Price
        </button>

        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setIsLockPanelOpen((prev) => !prev);
            setIsEditing(false);
            setIsUnlockConfirmOpen(false);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-stone-800"
        >
          <LockKeyhole size={13} />
          Lock Price
        </button>

        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setIsUnlockConfirmOpen((prev) => !prev);
            setIsEditing(false);
            setIsLockPanelOpen(false);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
          disabled={rate.status === "UNLOCKED"}
        >
          <LockOpen size={13} />
          Unlock Price
        </button>
        </div>
      ) : null}

      {message ? (
        <p className={`text-xs ${message.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>{message.text}</p>
      ) : null}
    </article>
  );
}
