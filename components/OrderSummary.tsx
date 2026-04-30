import { formatCurrency } from "@/lib/format";

export function OrderSummary({
  subtotal,
  shippingCharge,
  discount,
  ctaLabel = "Proceed",
  showCta = true
}: {
  subtotal: number;
  shippingCharge: number;
  discount: number;
  ctaLabel?: string;
  showCta?: boolean;
}) {
  const total = subtotal + shippingCharge - discount;

  return (
    <aside className="card space-y-4 p-5">
      <h3 className="font-heading text-xl text-stone-900">Order Summary</h3>

      <div className="space-y-2 text-sm text-stone-700">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span>{formatCurrency(shippingCharge)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Discount</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      </div>

      <div className="border-t border-stone-200 pt-3">
        <div className="flex items-center justify-between text-base font-semibold text-stone-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {showCta ? (
        <button className="w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700">
          {ctaLabel}
        </button>
      ) : null}
    </aside>
  );
}
