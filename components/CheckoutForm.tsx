"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, MapPin, Plus, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomSelect } from "@/components/ui/CustomSelect";

type AddressTag = "Home" | "Work" | "Gift" | "Other";

type CheckoutAddress = {
  id: string;
  nickname: string;
  tag: AddressTag;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

type AddressFormState = Omit<CheckoutAddress, "id">;

const emptyAddressForm: AddressFormState = {
  nickname: "",
  tag: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India"
};

const addressTags: Array<AddressTag | "All"> = ["All", "Home", "Work", "Gift", "Other"];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}

type CheckoutFormProps = {
  initialName?: string | null;
  initialEmail?: string | null;
  initialPhone?: string | null;
};

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm({ initialName, initialEmail, initialPhone }: CheckoutFormProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [activeTag, setActiveTag] = useState<AddressTag | "All">("All");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [loadingAddressBook, setLoadingAddressBook] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pincodeLookupLoading, setPincodeLookupLoading] = useState(false);
  const [pincodeLookupNotice, setPincodeLookupNotice] = useState<string | null>(null);
  const [pincodeLookupError, setPincodeLookupError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState(initialName || "");
  const [customerEmail, setCustomerEmail] = useState(initialEmail || "");
  const [customerPhone, setCustomerPhone] = useState(initialPhone || "");

  const filteredAddresses = useMemo(
    () => (activeTag === "All" ? addresses : addresses.filter((address) => address.tag === activeTag)),
    [activeTag, addresses]
  );

  const selectedAddress = addresses.find((item) => item.id === selectedAddressId) ?? addresses[0] ?? null;

  const loadAddresses = async () => {
    setLoadingAddressBook(true);
    setError(null);
    try {
      const res = await fetch("/api/account/addresses", { cache: "no-store" });
      const data = await res.json();
      if (res.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }
      if (!res.ok || !data?.success) {
        setError(data?.message || "Unable to load saved addresses.");
        return;
      }

      const normalized: CheckoutAddress[] = (data.addresses || []).map((address: any) => ({
        id: address.id,
        nickname: address.nickname || address.label || "Saved Address",
        tag: address.type === "WORK" ? "Work" : address.type === "OTHER" ? "Other" : "Home",
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || "India"
      }));

      setAddresses(normalized);
      if (normalized.length > 0) {
        setSelectedAddressId(normalized[0].id);
      } else {
        setSelectedAddressId("");
      }
    } catch {
      setError("Unable to load saved addresses.");
    } finally {
      setLoadingAddressBook(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  useEffect(() => {
    void (async () => {
      const loaded = await loadRazorpayScript();
      setRazorpayReady(loaded);
    })();
  }, []);

  const onAddressFieldChange = (field: keyof AddressFormState, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
    if (field === "pincode") {
      setPincodeLookupNotice(null);
      setPincodeLookupError(null);
    }
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setAddressForm(emptyAddressForm);
    setPincodeLookupNotice(null);
    setPincodeLookupError(null);
  };

  useEffect(() => {
    if (!isAddressModalOpen) return;

    const normalizedPincode = addressForm.pincode.replace(/\D/g, "").slice(0, 6);
    if (normalizedPincode !== addressForm.pincode) {
      setAddressForm((prev) => ({ ...prev, pincode: normalizedPincode }));
      return;
    }

    if (normalizedPincode.length !== 6) {
      setPincodeLookupLoading(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      void (async () => {
        setPincodeLookupLoading(true);
        setPincodeLookupError(null);
        try {
          const response = await fetch("/api/shipping/check-pincode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pincode: normalizedPincode })
          });
          const data = await response.json();

          if (!response.ok || !data?.success || !data?.isServiceable) {
            setPincodeLookupNotice(null);
            setPincodeLookupError(data?.message || "This pincode is not serviceable for secure shipping.");
            return;
          }

          setAddressForm((prev) => ({
            ...prev,
            city: String(data?.data?.city || prev.city || "").trim(),
            state: String(data?.data?.state || prev.state || "").trim(),
            country: prev.country || "India"
          }));
          setPincodeLookupNotice(
            [data?.data?.city, data?.data?.state].filter(Boolean).length
              ? `Delivery available in ${[data?.data?.city, data?.data?.state].filter(Boolean).join(", ")}.`
              : "Delivery available for this pincode."
          );
        } catch {
          setPincodeLookupNotice(null);
          setPincodeLookupError("Unable to verify pincode right now.");
        } finally {
          setPincodeLookupLoading(false);
        }
      })();
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [addressForm.pincode, isAddressModalOpen]);

  const saveAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void (async () => {
      setError(null);
      try {
        const shippingCheckRes = await fetch("/api/shipping/check-pincode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pincode: addressForm.pincode })
        });
        const shippingCheckData = await shippingCheckRes.json();

        if (!shippingCheckRes.ok || !shippingCheckData?.success || !shippingCheckData?.isServiceable) {
          setError(shippingCheckData?.message || "This pincode is not serviceable for secure shipping.");
          return;
        }

        const resolvedCity = String(shippingCheckData?.data?.city || addressForm.city || "").trim();
        const resolvedState = String(shippingCheckData?.data?.state || addressForm.state || "").trim();
        const resolvedCountry = String(addressForm.country || "India").trim();

        const res = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nickname: addressForm.nickname,
            label: addressForm.nickname,
            type: addressForm.tag.toUpperCase(),
            fullName: addressForm.fullName,
            phone: addressForm.phone,
            line1: addressForm.line1,
            line2: addressForm.line2,
            city: resolvedCity,
            state: resolvedState,
            pincode: addressForm.pincode,
            country: resolvedCountry,
            isDefault: addresses.length === 0
          })
        });
        const data = await res.json();
        if (res.status === 401) {
          router.push("/login?next=/checkout");
          return;
        }
        if (!res.ok || !data?.success) {
          setError(data?.message || "Unable to save address.");
          return;
        }
        await loadAddresses();
        setActiveTag("All");
        closeAddressModal();
      } catch {
        setError("Unable to save address.");
      }
    })();
  };

  const placeOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select or add a shipping address first.");
      return;
    }

    if (!razorpayReady || !window.Razorpay) {
      setError("Razorpay checkout is still loading. Please try again in a moment.");
      return;
    }

    setPlacingOrder(true);
    setError(null);
    setNotice(null);
    let handedOffToRazorpay = false;

    try {
      const res = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedAddressId })
      });
      const data = await res.json();

      if (res.status === 401 && data?.code === "AUTH_REQUIRED") {
        router.push("/login?next=/checkout");
        return;
      }
      if (!res.ok || !data?.success) {
        setError(data?.message || "Unable to place order.");
        return;
      }

      const key = data?.razorpayKeyId;
      if (!key) {
        setError("Razorpay key is missing from server configuration.");
        return;
      }
      const razorpay = new window.Razorpay({
        key,
        amount: data.amount,
        currency: data.currency,
        name: "House of Eraya",
        description: "Secure Jewelry Checkout",
        order_id: data.razorpayOrderId,
        prefill: {
          name: customerName || selectedAddress?.fullName || "",
          email: customerEmail || "",
          contact: customerPhone || selectedAddress?.phone || ""
        },
        notes: {
          localOrderNumber: data.orderNumber
        },
        theme: {
          color: "#9c7346"
        },
        modal: {
          ondismiss: () => {
            setNotice("Payment window closed. Your order is still pending until payment completes.");
            setPlacingOrder(false);
          }
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                ...response
              })
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.status === 401 && verifyData?.code === "AUTH_REQUIRED") {
              router.push("/login?next=/checkout");
              return;
            }

            if (!verifyRes.ok || !verifyData?.success) {
              setError(verifyData?.message || "Payment verification failed.");
              return;
            }

            setNotice("Payment verified successfully.");
            router.push(`/order-confirmation/${data.orderId}`);
          } catch {
            setError("Payment verification failed.");
          } finally {
            setPlacingOrder(false);
          }
        }
      });

      razorpay.on("payment.failed", (response: any) => {
        const message =
          response?.error?.description || response?.error?.reason || "Payment failed. Please try again.";
        if (
          typeof message === "string" &&
          message.toLowerCase().includes("international cards are not supported")
        ) {
          setError(
            "Card was blocked by gateway settings. In test mode, please use UPI test flow (success@razorpay)."
          );
        } else {
          setError(message);
        }
        setPlacingOrder(false);
      });

      handedOffToRazorpay = true;
      razorpay.open();
    } catch {
      setError("Unable to place order.");
    } finally {
      if (!handedOffToRazorpay) {
        setPlacingOrder(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <section className="card space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#9c7346]/35 bg-[#f6ebdf] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#7f6039]">
            One-Click Checkout
          </span>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-royal-700/75">
            Fast & Secure
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-royal-700/60">Full Name</span>
            <input
              className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-royal-800 outline-none placeholder:text-royal-700/35"
              placeholder="Your full name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-royal-700/60">Phone</span>
            <input
              className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-royal-800 outline-none placeholder:text-royal-700/35"
              placeholder="+91-XXXXXXXXXX"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs uppercase tracking-[0.16em] text-royal-700/60">Email</span>
            <input
              className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-royal-800 outline-none placeholder:text-royal-700/35"
              placeholder="you@example.com"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="card space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-xl text-royal-800">Select Shipping Address</h3>
          <button
            type="button"
            onClick={() => setIsAddressModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/12 bg-white px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-royal-700/80 transition hover:border-royal-700"
          >
            <Plus size={13} />
            Add New
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {addressTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition ${
                activeTag === tag
                  ? "border-royal-800 bg-royal-800 text-white"
                  : "border-black/12 bg-white text-royal-700/75"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {loadingAddressBook ? <p className="text-sm text-royal-700/70">Loading addresses...</p> : null}
        <div className="grid gap-3">
          {filteredAddresses.map((address) => {
            const active = address.id === selectedAddressId;
            return (
              <button
                key={address.id}
                type="button"
                onClick={() => setSelectedAddressId(address.id)}
                className={`rounded-2xl border p-3 text-left transition ${
                  active
                    ? "border-[#9c7346]/45 bg-[#f8efe4] shadow-sm"
                    : "border-black/10 bg-white hover:border-black/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.14em] text-royal-700/65">{address.nickname}</p>
                    <span className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-royal-700/65">
                      {address.tag}
                    </span>
                  </div>
                  {active ? <CheckCircle2 size={16} className="text-[#9c7346]" /> : null}
                </div>
                <p className="mt-1 text-sm font-medium text-royal-800">{address.fullName}</p>
                <p className="text-sm text-royal-700/80">{address.phone}</p>
                <p className="mt-2 text-sm leading-6 text-royal-700/80">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} - {address.pincode}
                </p>
              </button>
            );
          })}

          {!filteredAddresses.length ? (
            <p className="rounded-xl border border-dashed border-black/15 bg-white/70 px-3 py-4 text-center text-sm text-royal-700/70">
              No addresses available in this tag.
            </p>
          ) : null}
        </div>
      </section>

      <section className="card space-y-4 p-4 sm:p-5">
        <h3 className="font-heading text-xl text-royal-800">Billing & Payment</h3>
        <label className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-royal-700/85">
          <input
            type="checkbox"
            checked={useShippingAsBilling}
            onChange={(event) => setUseShippingAsBilling(event.target.checked)}
            className="h-4 w-4 accent-[#9c7346]"
          />
          Billing address same as shipping
        </label>

        {selectedAddress ? (
          <div className="rounded-2xl border border-black/10 bg-[#fbf7f1] p-3 text-sm text-royal-700/80">
          <div className="mb-2 flex items-center gap-2 text-royal-800">
            <MapPin size={15} />
            <span className="font-medium">Delivering to {selectedAddress.city}</span>
          </div>
          <p>
            {selectedAddress.line1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
          </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white p-3 text-sm text-royal-700/75">
            Add your first address to continue.
          </div>
        )}

        <button
          type="button"
          onClick={() => void placeOrder()}
          disabled={placingOrder || !selectedAddress}
          className="w-full rounded-full bg-royal-800 px-5 py-3 text-sm font-medium tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {placingOrder ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Opening Razorpay...
            </span>
          ) : (
            "Pay Securely with Razorpay"
          )}
        </button>

        {notice ? <p className="text-sm text-emerald-700">{notice}</p> : null}
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}

        <div className="flex items-center gap-2 text-xs text-royal-700/65">
          <ShieldCheck size={14} className="text-[#9c7346]" />
          <p>Razorpay secure checkout opens in a verified payment window and confirms your order instantly.</p>
        </div>
      </section>

      {isAddressModalOpen ? (
        <div className="fixed inset-0 z-[85] flex items-end bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-6">
          <button
            type="button"
            aria-label="Close modal backdrop"
            className="absolute inset-0"
            onClick={closeAddressModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add new address"
            className="relative z-10 w-full rounded-t-3xl border border-black/10 bg-[#f8f4ee] p-4 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-2xl text-royal-800">Add New Address</h3>
                <p className="mt-1 text-sm text-royal-700/70">Save it with a nickname and tag for faster toggles.</p>
              </div>

              <button
                type="button"
                onClick={closeAddressModal}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-royal-700 transition hover:bg-stone-100"
              >
                <X size={15} />
              </button>
            </div>

            <form className="space-y-3" onSubmit={saveAddress}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={addressForm.nickname}
                  onChange={(event) => onAddressFieldChange("nickname", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="Nickname (e.g. Mom's Place)"
                />

                <CustomSelect
                  value={addressForm.tag}
                  onValueChange={(value) => onAddressFieldChange("tag", value)}
                  options={[
                    { value: "Home", label: "Home" },
                    { value: "Work", label: "Work" },
                    { value: "Gift", label: "Gift" },
                    { value: "Other", label: "Other" }
                  ]}
                  buttonClassName="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none focus:border-[#9c7346]/55"
                  menuClassName="w-full"
                />

                <input
                  required
                  value={addressForm.fullName}
                  onChange={(event) => onAddressFieldChange("fullName", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="Full Name"
                />

                <input
                  required
                  value={addressForm.phone}
                  onChange={(event) => onAddressFieldChange("phone", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="Phone"
                />

                <input
                  required
                  value={addressForm.line1}
                  onChange={(event) => onAddressFieldChange("line1", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55 sm:col-span-2"
                  placeholder="Address Line 1"
                />

                <input
                  value={addressForm.line2}
                  onChange={(event) => onAddressFieldChange("line2", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55 sm:col-span-2"
                  placeholder="Address Line 2 (Optional)"
                />

                <input
                  required
                  value={addressForm.city}
                  onChange={(event) => onAddressFieldChange("city", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="City"
                />

                <input
                  required
                  value={addressForm.state}
                  onChange={(event) => onAddressFieldChange("state", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="State"
                />

                <input
                  required
                  value={addressForm.pincode}
                  onChange={(event) => onAddressFieldChange("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="Pincode"
                  inputMode="numeric"
                  maxLength={6}
                />

                <input
                  required
                  value={addressForm.country}
                  onChange={(event) => onAddressFieldChange("country", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="Country"
                />
              </div>

              {pincodeLookupLoading ? <p className="text-sm text-royal-700/70">Checking pincode serviceability...</p> : null}
              {pincodeLookupNotice ? <p className="text-sm text-emerald-700">{pincodeLookupNotice}</p> : null}
              {pincodeLookupError ? <p className="text-sm text-rose-700">{pincodeLookupError}</p> : null}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddressModal}
                  className="rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm text-royal-700 transition hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-royal-800 px-5 py-2.5 text-sm font-medium tracking-[0.08em] text-white"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
