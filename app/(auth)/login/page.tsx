"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "";
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "USER_NOT_FOUND") {
          const trimmed = identifier.trim();
          const isEmail = trimmed.includes("@");
          const nextQuery = nextPath ? `&next=${encodeURIComponent(nextPath)}` : "";
          const target = isEmail
            ? `/signup?email=${encodeURIComponent(trimmed)}${nextQuery}`
            : `/signup?phone=${encodeURIComponent(trimmed)}${nextQuery}`;
          router.push(target);
          return;
        }
        setError(data?.message || "Unable to start login.");
        return;
      }
      setChallengeToken(data.challengeToken);
      setMessage(data.message || "OTP sent successfully.");
    } catch {
      setError("Unable to start login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challengeToken) return;

    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, challengeToken, next: nextPath || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Login verification failed.");
        return;
      }
      setMessage("Login successful. Redirecting...");
      router.push(data?.redirectTo || "/account/profile");
      router.refresh();
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-royal-700/60">Welcome Back</p>
        <h1 className="font-heading text-4xl text-royal-800">Login</h1>
        <p className="text-sm text-royal-700/70">Use your email or mobile number. Phone OTP is sent live by SMS.</p>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6">
        {!challengeToken ? (
          <form className="space-y-4" onSubmit={requestOtp}>
            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-royal-700/60">Email or Phone</span>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
                placeholder="you@example.com or +91XXXXXXXXXX"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-royal-800 outline-none transition placeholder:text-royal-700/35 focus:border-[#9c7346] focus:ring-2 focus:ring-[#9c7346]/20"
              />
            </label>

            <button
              disabled={loading}
              className="w-full rounded-full bg-royal-800 px-5 py-3 text-sm font-medium tracking-[0.16em] text-white disabled:opacity-60"
            >
              {loading ? "SENDING OTP..." : "SEND OTP"}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={verifyOtp}>
            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-royal-700/60">Enter OTP</span>
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
                placeholder="Enter OTP"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-royal-800 outline-none transition placeholder:text-royal-700/35 focus:border-[#9c7346] focus:ring-2 focus:ring-[#9c7346]/20"
              />
            </label>

            <button
              disabled={loading}
              className="w-full rounded-full bg-royal-800 px-5 py-3 text-sm font-medium tracking-[0.16em] text-white disabled:opacity-60"
            >
              {loading ? "VERIFYING..." : "VERIFY & LOGIN"}
            </button>

            <button
              type="button"
              onClick={() => {
                setChallengeToken(null);
                setOtp("");
                setMessage("");
                setError("");
              }}
              className="w-full rounded-full border border-black/15 px-5 py-3 text-xs tracking-[0.12em] text-royal-700"
            >
              CHANGE EMAIL / PHONE
            </button>
          </form>
        )}

        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

        <p className="mt-4 text-center text-sm text-royal-700/70">
          If you are not registered,{" "}
          <Link href="/signup" className="font-medium text-royal-800 underline underline-offset-4">
            go to Signup
          </Link>
        </p>
      </div>
    </section>
  );
}
