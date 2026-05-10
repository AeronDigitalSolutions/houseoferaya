"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, MapPin, Package, UserRound, X } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

type CustomerAddress = {
  id: string;
  nickname: string | null;
  label: string | null;
  type: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
};

type CustomerWishlistItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  price: number;
  metalType: string;
  gemstone: string | null;
  imageUrl: string | null;
  addedAt: string;
};

type CustomerOrderItem = {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type CustomerOrder = {
  id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  createdAt: string;
  items: CustomerOrderItem[];
};

type CustomerRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  lifetimeValue: number;
  lastOrderAt: string | null;
  addressCount: number;
  hasWishlist: boolean;
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
  wishlistItems: CustomerWishlistItem[];
};

type Props = {
  customers: CustomerRow[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "No orders yet";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatJoinDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function formatDateOnly(value?: string | null) {
  if (!value) return "Not provided";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function CustomerDetailsModal({ customer, onClose }: { customer: CustomerRow; onClose: () => void }) {
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[130] flex items-end bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Customer details"
        className="relative h-[88vh] w-full overflow-hidden rounded-t-3xl border border-stone-200 bg-[#f8f5f0] shadow-2xl sm:h-auto sm:max-h-[88vh] sm:max-w-5xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">Customer Profile</p>
            <h3 className="mt-1 font-heading text-2xl text-stone-900 sm:text-3xl">{customer.name || "Unnamed User"}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-600">
              <StatusBadge active={customer.isActive} />
              <span>Joined {formatJoinDate(customer.createdAt)}</span>
              <span className="hidden sm:inline">•</span>
              <span>Updated {formatDate(customer.updatedAt)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:bg-stone-100"
            aria-label="Close customer details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-[calc(88vh-90px)] overflow-y-auto px-4 py-4 sm:h-auto sm:max-h-[calc(88vh-90px)] sm:px-6 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Total Orders</p>
              <p className="mt-1 font-heading text-2xl text-stone-900">{customer.orderCount}</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Lifetime Value</p>
              <p className="mt-1 font-heading text-2xl text-stone-900">{formatCurrency(customer.lifetimeValue)}</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Saved Addresses</p>
              <p className="mt-1 font-heading text-2xl text-stone-900">{customer.addresses.length}</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Wishlist Items</p>
              <p className="mt-1 font-heading text-2xl text-stone-900">{customer.wishlistItems.length}</p>
            </article>
          </div>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <h4 className="font-heading text-lg text-stone-900">Profile Details</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Full Name</p>
                <p className="mt-1 text-sm font-medium text-stone-900">{customer.name || "Not provided"}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Email</p>
                <p className="mt-1 break-words text-sm font-medium text-stone-900">{customer.email || "Not provided"}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Phone</p>
                <p className="mt-1 text-sm font-medium text-stone-900">{customer.phone || "Not provided"}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Date of Birth</p>
                <p className="mt-1 text-sm font-medium text-stone-900">{formatDateOnly(customer.dateOfBirth)}</p>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-stone-500" />
              <h4 className="font-heading text-lg text-stone-900">Saved Addresses</h4>
            </div>
            {customer.addresses.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600">No saved addresses yet.</p>
            ) : (
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {customer.addresses.map((address) => (
                  <article key={address.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-stone-900">
                        {address.nickname || address.label || titleCase(address.type)}
                      </p>
                      <div className="flex items-center gap-2">
                        {address.isDefault ? (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                            Default
                          </span>
                        ) : null}
                        <span className="rounded-full border border-stone-300 bg-white px-2 py-0.5 text-[11px] text-stone-700">
                          {titleCase(address.type)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-stone-800">{address.fullName} • {address.phone}</p>
                    <p className="mt-1 text-sm text-stone-700">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">{address.country} • Added {formatDate(address.createdAt)}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-stone-500" />
              <h4 className="font-heading text-lg text-stone-900">Wishlist</h4>
            </div>
            {customer.wishlistItems.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600">No wishlist items yet.</p>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {customer.wishlistItems.map((item) => (
                  <article key={item.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <p className="text-sm font-semibold text-stone-900">{item.productName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-stone-500">
                      {item.metalType}{item.gemstone ? ` • ${item.gemstone}` : ""}
                    </p>
                    <p className="mt-2 text-sm font-medium text-stone-900">{formatCurrency(item.price)}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                      <span>Saved {formatDate(item.addedAt)}</span>
                      <Link href={`/products/${item.productSlug}`} className="font-medium text-stone-700 underline">
                        View
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-stone-500" />
              <h4 className="font-heading text-lg text-stone-900">Order History</h4>
            </div>
            {customer.orders.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600">No orders placed yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {customer.orders.map((order) => (
                  <article key={order.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">#{order.orderNumber}</p>
                        <p className="mt-1 text-xs text-stone-500">Placed {formatDate(order.createdAt)}</p>
                      </div>
                      <p className="text-sm font-semibold text-stone-900">{formatCurrency(order.total)}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full border border-stone-300 bg-white px-2 py-1 text-stone-700">
                        Order: {titleCase(order.orderStatus)}
                      </span>
                      <span className="rounded-full border border-stone-300 bg-white px-2 py-1 text-stone-700">
                        Payment: {titleCase(order.paymentStatus)}
                      </span>
                      <span className="rounded-full border border-stone-300 bg-white px-2 py-1 text-stone-700">
                        Shipping: {titleCase(order.shippingStatus)}
                      </span>
                    </div>
                    {order.items.length > 0 ? (
                      <ul className="mt-3 space-y-2 border-t border-stone-200 pt-3">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex items-start justify-between gap-3 text-sm text-stone-700">
                            <div>
                              <p className="font-medium text-stone-900">{item.productName}</p>
                              <p className="text-xs text-stone-500">SKU: {item.sku} • Qty: {item.quantity}</p>
                            </div>
                            <p className="whitespace-nowrap font-medium text-stone-900">{formatCurrency(item.totalPrice)}</p>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export function AdminCustomersDirectory({ customers }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [orderFilter, setOrderFilter] = useState<"all" | "with-orders" | "no-orders">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "orders-desc" | "ltv-desc" | "recent-order">(
    "newest"
  );
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = customers.filter((customer) => {
      const haystack = [customer.name || "", customer.email || "", customer.phone || ""].join(" ").toLowerCase();
      const matchQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchStatus =
        statusFilter === "all" || (statusFilter === "active" ? customer.isActive : !customer.isActive);
      const matchOrders =
        orderFilter === "all" ||
        (orderFilter === "with-orders" ? customer.orderCount > 0 : customer.orderCount === 0);

      return matchQuery && matchStatus && matchOrders;
    });

    result.sort((a, b) => {
      if (sortBy === "newest") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (sortBy === "oldest") return +new Date(a.createdAt) - +new Date(b.createdAt);
      if (sortBy === "orders-desc") return b.orderCount - a.orderCount;
      if (sortBy === "ltv-desc") return b.lifetimeValue - a.lifetimeValue;

      const aTime = a.lastOrderAt ? +new Date(a.lastOrderAt) : 0;
      const bTime = b.lastOrderAt ? +new Date(b.lastOrderAt) : 0;
      return bTime - aTime;
    });

    return result;
  }, [customers, orderFilter, query, sortBy, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, orderFilter, sortBy, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, page, pageSize]);

  return (
    <>
      <section className="card overflow-hidden p-0">
        <div className="border-b border-stone-200 px-5 py-4">
          <h3 className="font-heading text-2xl text-stone-900">Customer Directory</h3>
          <p className="mt-1 text-sm text-stone-600">Real user data with profile details, order count, and lifetime value.</p>
          <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-600">
            <UserRound size={13} /> Tap or click a customer row to view full details.
          </p>
        </div>

        <div className="grid gap-3 border-b border-stone-200 bg-stone-50 px-5 py-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, email, or phone"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
            />
          </label>

          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Status</span>
            <CustomSelect
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" }
              ]}
              buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
              menuClassName="w-full"
            />
          </label>

          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Orders</span>
            <CustomSelect
              value={orderFilter}
              onValueChange={(value) => setOrderFilter(value as "all" | "with-orders" | "no-orders")}
              options={[
                { value: "all", label: "All" },
                { value: "with-orders", label: "With orders" },
                { value: "no-orders", label: "No orders" }
              ]}
              buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
              menuClassName="w-full"
            />
          </label>

          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Sort</span>
            <CustomSelect
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as "newest" | "oldest" | "orders-desc" | "ltv-desc" | "recent-order")
              }
              options={[
                { value: "newest", label: "Newest joined" },
                { value: "oldest", label: "Oldest joined" },
                { value: "orders-desc", label: "Most orders" },
                { value: "ltv-desc", label: "Highest LTV" },
                { value: "recent-order", label: "Recent order" }
              ]}
              buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
              menuClassName="w-full"
            />
          </label>
        </div>

        <div className="border-b border-stone-200 px-5 py-3 text-sm text-stone-600">
          Showing <span className="font-medium text-stone-900">{pageItems.length}</span> of{" "}
          <span className="font-medium text-stone-900">{filteredCustomers.length}</span> customers
        </div>

        {pageItems.length === 0 ? (
          <div className="px-5 py-8 text-sm text-stone-600">No customers found for selected filters.</div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.14em] text-stone-500">
                    <th className="w-[20%] px-5 py-3 font-medium">Customer</th>
                    <th className="w-[30%] px-5 py-3 font-medium">Contact</th>
                    <th className="w-[12%] px-5 py-3 font-medium">Orders</th>
                    <th className="w-[14%] px-5 py-3 font-medium">Lifetime Value</th>
                    <th className="w-[15%] px-5 py-3 font-medium">Last Order</th>
                    <th className="w-[9%] whitespace-nowrap px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {pageItems.map((customer) => (
                    <tr
                      key={customer.id}
                      className="cursor-pointer align-top transition hover:bg-stone-50"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="px-5 py-5">
                        <p className="text-sm font-semibold text-stone-900">{customer.name || "Unnamed User"}</p>
                        <p className="mt-1 text-xs text-stone-500">Joined {formatJoinDate(customer.createdAt)}</p>
                      </td>
                      <td className="px-5 py-5">
                        <p className="break-words text-sm text-stone-800">{customer.email || "No email"}</p>
                        <p className="mt-1 break-words text-xs text-stone-500">{customer.phone || "No phone"}</p>
                      </td>
                      <td className="px-5 py-5">
                        <p className="text-sm font-medium text-stone-900">{customer.orderCount}</p>
                        <p className="mt-1 text-xs text-stone-500">{customer.hasWishlist ? "Has wishlist" : "No wishlist"}</p>
                      </td>
                      <td className="px-5 py-5 text-sm font-medium text-stone-900">{formatCurrency(customer.lifetimeValue)}</td>
                      <td className="px-5 py-5 text-sm text-stone-700">{formatDate(customer.lastOrderAt)}</td>
                      <td className="whitespace-nowrap px-5 py-5">
                        <StatusBadge active={customer.isActive} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-stone-200 md:hidden">
              {pageItems.map((customer) => (
                <article
                  key={customer.id}
                  className="cursor-pointer space-y-2 px-5 py-4 transition hover:bg-stone-50"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{customer.name || "Unnamed User"}</p>
                      <p className="mt-1 text-xs text-stone-500">Joined {formatJoinDate(customer.createdAt)}</p>
                    </div>
                    <StatusBadge active={customer.isActive} />
                  </div>
                  <p className="break-words text-sm text-stone-800">{customer.email || "No email"}</p>
                  <p className="break-words text-xs text-stone-500">{customer.phone || "No phone"}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                    <p>
                      Orders: <span className="font-medium text-stone-900">{customer.orderCount}</span>
                    </p>
                    <p>
                      LTV: <span className="font-medium text-stone-900">{formatCurrency(customer.lifetimeValue)}</span>
                    </p>
                    <p>
                      Wishlist: <span className="font-medium text-stone-900">{customer.hasWishlist ? "Yes" : "No"}</span>
                    </p>
                  </div>
                  <p className="text-xs text-stone-500">Last order: {formatDate(customer.lastOrderAt)}</p>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-5 py-4">
          <label className="flex items-center gap-2 text-sm text-stone-600">
            Rows
            <CustomSelect
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
              options={[
                { value: "5", label: "5" },
                { value: "10", label: "10" },
                { value: "20", label: "20" },
                { value: "50", label: "50" }
              ]}
              buttonClassName="w-[72px] rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm text-stone-800"
              menuClassName="w-[96px]"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-700 disabled:opacity-40"
            >
              Prev
            </button>
            <p className="text-sm text-stone-700">
              Page <span className="font-semibold text-stone-900">{page}</span> of{" "}
              <span className="font-semibold text-stone-900">{totalPages}</span>
            </p>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {selectedCustomer ? <CustomerDetailsModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} /> : null}
    </>
  );
}
