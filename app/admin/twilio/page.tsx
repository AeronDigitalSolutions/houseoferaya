import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CheckCircle2, MessageSquare, ShieldCheck, Wallet } from "lucide-react";
import { requireAdminPermission } from "@/lib/auth/admin-guard";
import { fetchTwilioAdminSummary } from "@/lib/twilio-account";
import { AdminDashboardRefreshButton } from "@/components/ui/AdminDashboardRefreshButton";

export const dynamic = "force-dynamic";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function maskMiddle(value: string, visibleStart = 8, visibleEnd = 6) {
  if (!value || value.length <= visibleStart + visibleEnd) return value;
  return `${value.slice(0, visibleStart)}...${value.slice(-visibleEnd)}`;
}

function DetailCard({
  label,
  value,
  helper,
  mono = false
}: {
  label: string;
  value: string;
  helper: string;
  mono?: boolean;
}) {
  return (
    <article className="rounded-[1.6rem] border border-[#eadcc3] bg-white/80 p-5 shadow-[0_12px_30px_rgba(109,84,38,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a8462]">{label}</p>
      <p className={`mt-3 text-sm text-stone-900 ${mono ? "break-all font-mono" : "font-medium"}`}>{value}</p>
      <p className="mt-3 text-xs leading-5 text-stone-500">{helper}</p>
    </article>
  );
}

export default async function AdminTwilioPage() {
  await requireAdminPermission("canViewPayments");

  let summary:
    | Awaited<ReturnType<typeof fetchTwilioAdminSummary>>
    | null = null;
  let error: string | null = null;

  try {
    summary = await fetchTwilioAdminSummary();
  } catch (twilioError) {
    error = twilioError instanceof Error ? twilioError.message : "Unable to load Twilio account details.";
  }

  const lowBalance = summary ? summary.balance <= 5 : false;
  const isTrial = summary ? titleCase(summary.type) === "Trial" : false;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2.25rem] border border-[#dec9a1]/60 bg-[radial-gradient(circle_at_top_left,#fff7e8_0%,#f7eedf_35%,#f6f0e7_65%,#fbfaf6_100%)] shadow-[0_24px_60px_rgba(109,80,28,0.1)]">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.45fr)_360px] lg:px-8 lg:py-8">
          <div className="relative space-y-5">
            <div className="pointer-events-none absolute -left-10 top-0 h-36 w-36 rounded-full bg-[#f3dcb0]/40 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-24 h-24 w-24 rounded-full bg-[#f7edd8] blur-2xl" />

            <div className="relative flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d8b16b]/70 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8f6a33] backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Twilio Control
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Live account sync
              </span>
              {isTrial ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/90 px-3 py-1.5 text-xs font-medium text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  Trial account
                </span>
              ) : null}
            </div>

            <div className="relative space-y-3">
              <h2 className="font-heading text-4xl tracking-[-0.03em] text-stone-900 sm:text-[3.4rem]">Twilio Wallet</h2>
              <p className="max-w-2xl text-base leading-7 text-stone-600">
                A cleaner operational view for OTP infrastructure, wallet health, Verify configuration, and account
                readiness without leaving your admin dashboard.
              </p>
            </div>

            <div className="relative flex flex-wrap gap-3">
              <Link
                href="https://console.twilio.com/"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-[#1f1b17] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#342b22]"
              >
                Open Twilio Console
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/70 px-4 py-3 text-sm text-stone-700 backdrop-blur">
                <MessageSquare className="h-4 w-4 text-[#9b7445]" />
                Verify linked with live phone OTP
              </span>
              <AdminDashboardRefreshButton label="Refresh Twilio" compactLabel="Refresh" />
            </div>
          </div>

          <div className="relative rounded-[2rem] border border-[#e6d7bd] bg-white/78 p-5 shadow-[0_12px_32px_rgba(95,75,39,0.08)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a8462]">Wallet Snapshot</p>
                <p className="mt-3 font-heading text-4xl text-stone-900">
                  {summary ? formatMoney(summary.balance, summary.currency) : "--"}
                </p>
                <p className="mt-2 text-sm text-stone-500">Current balance available for messaging and verification usage.</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7edd9] text-[#926a34]">
                <Wallet className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-[#eee2cc] bg-[#fcfaf5] px-4 py-3">
                <span className="text-sm text-stone-500">Status</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {summary ? titleCase(summary.status) : "--"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[#eee2cc] bg-[#fcfaf5] px-4 py-3">
                <span className="text-sm text-stone-500">Currency</span>
                <span className="text-sm font-semibold text-stone-900">{summary?.currency ?? "--"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[#eee2cc] bg-[#fcfaf5] px-4 py-3">
                <span className="text-sm text-stone-500">Type</span>
                <span className="text-sm font-semibold text-stone-900">{summary ? titleCase(summary.type) : "--"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-[2rem] border border-rose-200 bg-[linear-gradient(135deg,#fff7f7_0%,#fff1f1_100%)] p-5 text-sm text-rose-700 shadow-[0_10px_28px_rgba(127,29,29,0.06)]">
          <p className="font-semibold text-rose-800">Twilio data could not be loaded</p>
          <p className="mt-1">{error}</p>
        </section>
      ) : null}

      {summary ? (
        <>
          <section className="overflow-hidden rounded-[2.1rem] border border-[#dec9a1]/60 bg-[linear-gradient(180deg,#fffdf8_0%,#f6f0e7_100%)] shadow-[0_16px_40px_rgba(109,84,38,0.07)]">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#eadcc3] px-6 py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a8462]">Account Details</p>
                <h3 className="mt-2 font-heading text-2xl text-stone-900">Twilio Configuration Snapshot</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                  Core identifiers and operating notes currently attached to your phone OTP infrastructure.
                </p>
              </div>
              <span className="rounded-full border border-stone-300 bg-white/75 px-4 py-2 text-xs font-medium text-stone-700">
                Synced from live Twilio account
              </span>
            </div>

            <div className="grid gap-4 px-6 py-6 lg:grid-cols-2">
              <DetailCard
                label="Friendly Name"
                value={summary.friendlyName}
                helper="This is the Twilio project name currently associated with your OTP setup."
              />
              <DetailCard
                label="Account SID"
                value={summary.accountSid}
                helper="Primary Twilio account identifier used by the live integration."
                mono
              />
              <DetailCard
                label="Verify Service SID"
                value={summary.verifyServiceSid || "Not configured"}
                helper="Verify service identifier used for SMS OTP sending and verification checks."
                mono
              />
              <DetailCard
                label="Recharge"
                value="Recharge remains managed from Twilio Billing / Console."
                helper="Balance top-up is still controlled on Twilio's side, so this panel focuses on visibility and operational monitoring."
              />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
