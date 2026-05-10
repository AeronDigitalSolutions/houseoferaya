"use client";

import { FormEvent, useState } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function AdminPasswordResetPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Please fill all password fields." });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirm password do not match." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const payload = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok) {
        setMessage({ type: "error", text: payload.message || "Unable to reset password." });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ type: "success", text: payload.message || "Password reset successful." });
    } catch {
      setMessage({ type: "error", text: "Unable to reset password right now." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card rounded-3xl p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="font-heading text-3xl text-stone-900 sm:text-4xl">Account Security</h2>
        <p className="mt-1 text-sm text-stone-600">Update your own admin password securely.</p>
      </div>

      <form className="max-w-xl space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-600">Current password</span>
          <PasswordInput
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            inputClassName="border-stone-300 py-2.5 focus:border-stone-500 focus:ring-0"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-600">New password</span>
          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            inputClassName="border-stone-300 py-2.5 focus:border-stone-500 focus:ring-0"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-600">Confirm new password</span>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            inputClassName="border-stone-300 py-2.5 focus:border-stone-500 focus:ring-0"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium tracking-[0.12em] text-white disabled:opacity-60"
        >
          {loading ? "UPDATING..." : "UPDATE PASSWORD"}
        </button>
      </form>

      {message ? (
        <p className={`mt-4 text-sm ${message.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>
          {message.text}
        </p>
      ) : null}
    </section>
  );
}
