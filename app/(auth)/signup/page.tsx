"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "";
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefillEmail = searchParams.get("email");
    const prefillPhone = searchParams.get("phone");
    const prefillContact = searchParams.get("contact");

    if (prefillContact && !contact) {
      setContact(prefillContact);
    }
    if (!prefillContact && prefillEmail && !contact) {
      setContact(prefillEmail);
    }
    if (!prefillContact && !prefillEmail && prefillPhone && !contact) {
      setContact(prefillPhone);
    }
  }, [searchParams, contact]);

  const requestOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          identifier: contact
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "USER_EXISTS") {
          setError("You are already registered. Please login.");
          return;
        }
        setError(data?.message || "Unable to start registration.");
        return;
      }
      setChallengeToken(data.challengeToken);
      setMessage(data.message || "OTP sent successfully.");
    } catch {
      setError("Unable to start registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challengeToken) return;

    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          challengeToken,
          next: nextPath || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "USER_EXISTS") {
          setError("You are already registered. Please login.");
          return;
        }
        setError(data?.message || "Registration verification failed.");
        return;
      }

      setMessage("Registration successful. Redirecting...");
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
        <p className="text-xs uppercase tracking-[0.24em] text-royal-700/60">Create Your Account</p>
        <h1 className="font-heading text-4xl text-royal-800">Signup</h1>
        <p className="text-sm text-royal-700/70">Full name + one contact detail required. Phone OTP is sent live by SMS.</p>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6">
        {!challengeToken ? (
          <form className="space-y-4" onSubmit={requestOtp}>
            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-royal-700/60">Full Name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                type="text"
                required
                placeholder="Your full name"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-royal-800 outline-none transition placeholder:text-royal-700/35 focus:border-[#9c7346] focus:ring-2 focus:ring-[#9c7346]/20"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-royal-700/60">Email or Phone</span>
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                type="text"
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
                type="text"
                required
                placeholder="Enter OTP"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-royal-800 outline-none transition placeholder:text-royal-700/35 focus:border-[#9c7346] focus:ring-2 focus:ring-[#9c7346]/20"
              />
            </label>

            <button
              disabled={loading}
              className="w-full rounded-full bg-royal-800 px-5 py-3 text-sm font-medium tracking-[0.16em] text-white disabled:opacity-60"
            >
              {loading ? "VERIFYING..." : "VERIFY & CREATE ACCOUNT"}
            </button>

            <button
              type="button"
              onClick={() => {
                setChallengeToken(null);
                setOtp("");
                setError("");
                setMessage("");
              }}
              className="w-full rounded-full border border-black/15 px-5 py-3 text-xs tracking-[0.12em] text-royal-700"
            >
              EDIT REGISTRATION DETAILS
            </button>
          </form>
        )}

        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

        <p className="mt-4 text-center text-sm text-royal-700/70">
          Already registered?{" "}
          <Link
            href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
            className="font-medium text-royal-800 underline underline-offset-4"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
