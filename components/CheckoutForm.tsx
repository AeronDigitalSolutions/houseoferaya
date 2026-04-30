"use client";

import { AddressForm } from "@/components/AddressForm";

export function CheckoutForm() {
  return (
    <div className="space-y-5">
      <section className="card space-y-4 p-5">
        <h3 className="font-heading text-xl text-stone-900">Customer Details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Email" />
          <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Phone" />
        </div>
      </section>

      <AddressForm title="Shipping Address" />
      <AddressForm title="Billing Address" />

      <section className="card space-y-4 p-5">
        <h3 className="font-heading text-xl text-stone-900">Payment</h3>
        <p className="text-sm text-stone-600">Razorpay integration placeholder. Connect order and payment IDs in API layer.</p>
        <button className="w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700">
          Pay with Razorpay (Placeholder)
        </button>
      </section>
    </div>
  );
}
