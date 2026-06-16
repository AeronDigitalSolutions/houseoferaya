"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpDown, BadgeIndianRupee, CircleAlert, CreditCard, Search, Wallet } from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { StatusBadge } from "@/components/StatusBadge";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/CustomSelect";
import { AdminDashboardRefreshButton } from "@/components/ui/AdminDashboardRefreshButton";
import { formatCurrency } from "@/lib/format";

type PaymentStatus = "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
type PaymentProvider = "RAZORPAY" | "COD" | "MANUAL";

type PaymentItem = {
  id: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  methodLabel: string;
  failureReason: string | null;
  syncError: boolean;
  order: {
    id: string;
    orderNumber: string;
    total: number;
    paymentStatus: PaymentStatus;
    orderStatus: string;
    createdAt: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
};

type Props = {
  payments: PaymentItem[];
  razorpayLinked: boolean;
  syncErrorCount: number;
};

const STATUS_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "AUTHORIZED", label: "Authorized" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" }
];

const PROVIDER_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Providers" },
  { value: "RAZORPAY", label: "Razorpay" },
  { value: "COD", label: "COD" },
  { value: "MANUAL", label: "Manual" }
];

const SYNC_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Sync States" },
  { value: "healthy", label: "Healthy" },
  { value: "delayed", label: "Delayed" }
];

const DATE_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Time" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" }
];

const SORT_OPTIONS: CustomSelectOption[] = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount-high", label: "Highest Amount" },
  { value: "amount-low", label: "Lowest Amount" },
  { value: "status", label: "Status A-Z" }
];

const PAGE_SIZE = 20;

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function matchesDateWindow(value: string, windowKey: string) {
  if (windowKey === "all") return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = Date.now();
  const ageMs = now - date.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  if (windowKey === "7d") return ageMs <= 7 * dayMs;
  if (windowKey === "30d") return ageMs <= 30 * dayMs;
  if (windowKey === "90d") return ageMs <= 90 * dayMs;
  return true;
}

export function AdminPaymentsManager({ payments, razorpayLinked, syncErrorCount }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [providerFilter, setProviderFilter] = useState<"all" | PaymentProvider>("all");
  const [syncFilter, setSyncFilter] = useState<"all" | "healthy" | "delayed">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "amount-high" | "amount-low" | "status">("latest");
  const [page, setPage] = useState(1);

  const filteredPayments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = payments.filter((payment) => {
      const matchesQuery =
        !normalizedQuery ||
        payment.order.orderNumber.toLowerCase().includes(normalizedQuery) ||
        payment.order.customerName.toLowerCase().includes(normalizedQuery) ||
        payment.order.customerEmail.toLowerCase().includes(normalizedQuery) ||
        payment.order.customerPhone.toLowerCase().includes(normalizedQuery) ||
        payment.razorpayOrderId?.toLowerCase().includes(normalizedQuery) ||
        payment.razorpayPaymentId?.toLowerCase().includes(normalizedQuery) ||
        payment.methodLabel.toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
      const matchesProvider = providerFilter === "all" || payment.provider === providerFilter;
      const matchesSync =
        syncFilter === "all" ||
        (syncFilter === "healthy" && !payment.syncError) ||
        (syncFilter === "delayed" && payment.syncError);
      const matchesDate = matchesDateWindow(payment.createdAt, dateFilter);

      return matchesQuery && matchesStatus && matchesProvider && matchesSync && matchesDate;
    });

    const sorted = [...filtered];
    sorted.sort((left, right) => {
      if (sortBy === "latest") return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      if (sortBy === "oldest") return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      if (sortBy === "amount-high") return right.amount - left.amount;
      if (sortBy === "amount-low") return left.amount - right.amount;
      return left.status.localeCompare(right.status);
    });

    return sorted;
  }, [dateFilter, payments, providerFilter, query, sortBy, statusFilter, syncFilter]);

  const totalCollected = filteredPayments
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingCount = filteredPayments.filter((payment) => payment.status === "PENDING" || payment.status === "AUTHORIZED").length;
  const failedCount = filteredPayments.filter((payment) => payment.status === "FAILED" || payment.status === "REFUNDED").length;
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, providerFilter, syncFilter, dateFilter, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagePayments = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPayments.slice(start, start + PAGE_SIZE);
  }, [filteredPayments, page]);

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[1.6rem] border border-[#e1d4bb] bg-[#fffdf8] px-4 py-3 shadow-[0_10px_24px_rgba(111,89,47,0.05)]">
        <div>
          <h2 className="font-heading text-2xl text-stone-900">Payments</h2>
          <p className="mt-1 text-sm text-stone-500">
            Live Razorpay-backed payment view with manual refresh for the latest status sync.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
              razorpayLinked
                ? "border border-emerald-200 bg-emerald-50/90 text-emerald-700"
                : "border border-stone-300 bg-white text-stone-700"
            }`}
          >
            {razorpayLinked ? "Razorpay connected" : "Razorpay not linked"}
          </span>
          <AdminDashboardRefreshButton label="Refresh Payments" compactLabel="Refresh" />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card border-[#dfcfb0] bg-[#fffdf8] p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-stone-500">
            <Wallet className="h-4 w-4 text-[#9b7445]" />
            Filtered Records
          </p>
          <p className="mt-2 font-heading text-3xl text-stone-900">{filteredPayments.length}</p>
          <p className="mt-1 text-xs text-stone-500">of {payments.length} total records</p>
        </article>
        <article className="card border-[#dfcfb0] bg-[#fffdf8] p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-stone-500">
            <BadgeIndianRupee className="h-4 w-4 text-[#9b7445]" />
            Collected
          </p>
          <p className="mt-2 font-heading text-2xl text-stone-900">{formatCurrency(totalCollected)}</p>
          <p className="mt-1 text-xs text-stone-500">based on current filters</p>
        </article>
        <article className="card border-[#dfcfb0] bg-[#fffdf8] p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-stone-500">
            <Activity className="h-4 w-4 text-[#9b7445]" />
            Pending / Authorized
          </p>
          <p className="mt-2 font-heading text-3xl text-stone-900">{pendingCount}</p>
          <p className="mt-1 text-xs text-stone-500">needs review or completion</p>
        </article>
        <article className="card border-[#dfcfb0] bg-[#fffdf8] p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-stone-500">
            <CircleAlert className="h-4 w-4 text-[#9b7445]" />
            Failed / Refunded
          </p>
          <p className="mt-2 font-heading text-3xl text-stone-900">{failedCount}</p>
          <p className="mt-1 text-xs text-stone-500">requires follow-up</p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-[#d8c7a3]/55 bg-[#fffdf9] p-4 shadow-[0_10px_30px_rgba(111,89,47,0.08)]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="space-y-1.5 xl:col-span-2">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Search</span>
            <div className="flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3">
              <Search className="h-4 w-4 text-stone-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Order no, customer, phone, Razorpay ID"
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
              />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Status</span>
            <CustomSelect
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
              options={STATUS_OPTIONS}
              ariaLabel="Payment status filter"
              buttonClassName="h-11 rounded-2xl border-black/10 px-3"
              menuClassName="rounded-2xl border-black/10 bg-[#fbf7f0] p-1.5 shadow-[0_18px_36px_rgba(32,27,20,0.12)]"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Provider</span>
            <CustomSelect
              value={providerFilter}
              onValueChange={(value) => setProviderFilter(value as typeof providerFilter)}
              options={PROVIDER_OPTIONS}
              ariaLabel="Payment provider filter"
              buttonClassName="h-11 rounded-2xl border-black/10 px-3"
              menuClassName="rounded-2xl border-black/10 bg-[#fbf7f0] p-1.5 shadow-[0_18px_36px_rgba(32,27,20,0.12)]"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Sync</span>
            <CustomSelect
              value={syncFilter}
              onValueChange={(value) => setSyncFilter(value as typeof syncFilter)}
              options={SYNC_OPTIONS}
              ariaLabel="Payment sync filter"
              buttonClassName="h-11 rounded-2xl border-black/10 px-3"
              menuClassName="rounded-2xl border-black/10 bg-[#fbf7f0] p-1.5 shadow-[0_18px_36px_rgba(32,27,20,0.12)]"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Date Window</span>
            <CustomSelect
              value={dateFilter}
              onValueChange={(value) => setDateFilter(value as typeof dateFilter)}
              options={DATE_OPTIONS}
              ariaLabel="Payment date window filter"
              buttonClassName="h-11 rounded-2xl border-black/10 px-3"
              menuClassName="rounded-2xl border-black/10 bg-[#fbf7f0] p-1.5 shadow-[0_18px_36px_rgba(32,27,20,0.12)]"
            />
          </label>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Sort By</span>
            <div className="flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3">
              <ArrowUpDown className="h-4 w-4 text-stone-400" />
              <CustomSelect
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
                options={SORT_OPTIONS}
                ariaLabel="Payment sort order"
                className="w-full"
                buttonClassName="h-auto border-0 bg-transparent px-0 py-0 shadow-none hover:border-0"
                menuClassName="rounded-2xl border-black/10 bg-[#fbf7f0] p-1.5 shadow-[0_18px_36px_rgba(32,27,20,0.12)]"
              />
            </div>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
                setProviderFilter("all");
                setSyncFilter("all");
                setDateFilter("all");
                setSortBy("latest");
              }}
              className="h-11 rounded-full border border-stone-300 bg-white px-5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[#d8c7a3]/55 bg-gradient-to-b from-[#fdfbf6] to-[#f6f1e8] shadow-[0_10px_30px_rgba(111,89,47,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ddcfb2]/55 px-5 py-4">
          <div className="space-y-1">
            <h3 className="font-heading text-xl text-stone-900">Payment Activity</h3>
            <p className="text-sm text-stone-500">Filtered payment records</p>
          </div>
          <div className="rounded-full border border-stone-200 bg-white/75 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-stone-500">
            {pagePayments.length} visible entries
          </div>
        </div>

        {pagePayments.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 font-medium text-stone-900">No payments match the current filters.</p>
            <p className="mt-1 text-sm text-stone-500">Try broadening the search or resetting filters to view more payment records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] text-left text-sm">
              <thead className="border-b border-[#d8c7a3]/50 bg-gradient-to-r from-[#f6ede0] via-[#f4ecd9] to-[#f8f2e8]">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Order</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Customer</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Amount</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Method</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Razorpay Order ID</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Razorpay Payment ID</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Paid At</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ddcfb2]/55">
                {pagePayments.map((payment) => (
                  <tr key={payment.id} className="bg-white/50 align-top transition hover:bg-[#fff8eb]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-stone-900">{payment.order.orderNumber}</p>
                      <p className="mt-1 text-xs text-stone-500">Order total: {formatCurrency(payment.order.total)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-900">{payment.order.customerName}</p>
                      <p className="mt-1 text-xs text-stone-500">{payment.order.customerEmail}</p>
                      <p className="mt-1 text-xs text-stone-500">{payment.order.customerPhone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-stone-900">{formatCurrency(payment.amount)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-stone-900">{payment.methodLabel}</p>
                      {payment.failureReason ? <p className="mt-1 max-w-[220px] text-xs text-rose-600">{payment.failureReason}</p> : null}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-stone-700">{payment.razorpayOrderId || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-stone-700">{payment.razorpayPaymentId || "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <StatusBadge status={payment.status} />
                        {payment.syncError ? (
                          <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                            Sync delayed
                          </span>
                        ) : (
                          <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                            Synced
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-stone-600">{formatDateTime(payment.paidAt)}</td>
                    <td className="px-5 py-4 text-xs text-stone-600">{formatDateTime(payment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={filteredPayments.length}
          pageSize={PAGE_SIZE}
          currentCount={pagePayments.length}
          onPageChange={setPage}
          itemLabel="payments"
        />
      </section>
    </div>
  );
}
