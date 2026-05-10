"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@local.com");
  const [password, setPassword] = useState("admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Unable to login.");
        return;
      }
      router.push(data?.redirectTo || "/admin");
      router.refresh();
    } catch {
      setError("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-base min-h-screen pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-md rounded-3xl border border-black/10 bg-white/80 p-6 shadow-soft backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-royal-700/60">Admin Access</p>
          <h1 className="font-heading text-4xl text-royal-800">Admin Login</h1>
          <p className="text-sm text-royal-700/70">Secure access for Super Admin and team admins.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-[0.18em] text-royal-700/60">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-royal-800 outline-none transition focus:border-[#9c7346] focus:ring-2 focus:ring-[#9c7346]/20"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-[0.18em] text-royal-700/60">Password</span>
            <PasswordInput
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
              inputClassName="text-royal-800"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-royal-800 px-5 py-3 text-sm font-medium tracking-[0.16em] text-white disabled:opacity-60"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
        <p className="mt-4 text-center text-xs text-royal-700/65">
          Default Super Admin: <span className="font-medium">admin@local.com / admin@123</span>
        </p>
      </div>
    </main>
  );
}
