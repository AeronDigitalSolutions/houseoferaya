"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MapPin, Truck } from "lucide-react";

type Props = {
  variant?: "classic" | "signature";
};

type LookupResult = {
  city?: string;
  state?: string;
};

const STORAGE_KEY = "eraya-pincode-check";

export function PincodeAvailabilityChecker({ variant = "classic" }: Props) {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [details, setDetails] = useState<LookupResult | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPincode(saved);
    }
  }, []);

  const runCheck = async () => {
    const normalized = pincode.replace(/\D/g, "").slice(0, 6);
    setPincode(normalized);
    setError(null);
    setSuccess(null);
    setDetails(null);

    if (normalized.length !== 6) {
      setError("Enter a valid 6 digit pincode to check delivery availability.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/shipping/check-pincode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: normalized })
      });
      const data = await response.json();

      if (!response.ok || !data?.success || !data?.isServiceable) {
        setError(data?.message || "Delivery is not available for this pincode yet.");
        return;
      }

      const nextDetails = {
        city: data?.data?.city,
        state: data?.data?.state
      } satisfies LookupResult;

      setDetails(nextDetails);
      setSuccess(
        [nextDetails.city, nextDetails.state].filter(Boolean).length
          ? `Delivery is available in ${[nextDetails.city, nextDetails.state].filter(Boolean).join(", ")}.`
          : "Delivery is available for this pincode."
      );

      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, normalized);
      }
    } catch {
      setError("Unable to check delivery availability right now.");
    } finally {
      setLoading(false);
    }
  };

  const cardClassName =
    variant === "signature"
      ? "rounded-2xl border border-[#d7c8aa] bg-[#fbf8f1] p-4"
      : "rounded-2xl border border-stone-300/70 bg-white/85 p-4";
  const inputClassName =
    variant === "signature"
      ? "h-12 rounded-xl border border-[#d7c8aa] bg-white px-3 text-sm text-[#1f2739] outline-none placeholder:text-[#7b7f89]"
      : "h-12 rounded-xl border border-stone-200 bg-white px-3 text-sm text-[#1b1d21] outline-none placeholder:text-[#7b8089]";
  const buttonClassName =
    variant === "signature"
      ? "h-12 rounded-xl bg-[#11275d] px-4 text-sm font-medium text-white transition hover:bg-[#0d1f49]"
      : "h-12 rounded-xl bg-[#121212] px-4 text-sm font-medium text-white transition hover:bg-[#23272f]";

  return (
    <div className={cardClassName}>
      <div className="flex items-center gap-2 text-[#775a19]">
        <Truck className="h-4 w-4" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b8089]">Check Availability In Your Area</p>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={pincode}
          onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          className={`${inputClassName} flex-1`}
          placeholder="Enter 6 digit pincode"
          inputMode="numeric"
          maxLength={6}
        />
        <button type="button" onClick={() => void runCheck()} disabled={loading} className={buttonClassName}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking
            </span>
          ) : (
            "Check"
          )}
        </button>
      </div>

      {success ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>{success}</span>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</div>
      ) : null}

      {!success && !error ? (
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-[#666d78]">
          <MapPin className="h-3.5 w-3.5" />
          Check whether this piece can be securely delivered to your pincode.
        </p>
      ) : null}
    </div>
  );
}
