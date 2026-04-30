import { formatCurrency } from "@/lib/format";
import type { CartLine } from "@/lib/types";

export function CartItem({ item }: { item: CartLine }) {
  const lineTotal = item.product.price * item.quantity;

  return (
    <article className="card grid gap-4 p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center">
      <img src={item.product.image} alt={item.product.name} className="h-24 w-24 rounded-xl object-cover" />

      <div className="space-y-1">
        <h3 className="font-heading text-lg text-stone-900">{item.product.name}</h3>
        <p className="text-sm text-stone-600">{item.product.metalType}</p>
        <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
      </div>

      <div className="space-y-2 text-right">
        <p className="text-sm font-semibold text-stone-900">{formatCurrency(lineTotal)}</p>
        <div className="flex justify-end gap-2 text-xs">
          <button className="rounded-full border border-stone-300 px-3 py-1">Update Qty</button>
          <button className="rounded-full border border-rose-200 px-3 py-1 text-rose-700">Remove</button>
        </div>
      </div>
    </article>
  );
}
