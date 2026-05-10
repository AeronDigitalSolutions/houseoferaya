"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { CartLine } from "@/lib/types";

type CartItemProps = {
  item: CartLine;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onRemove?: () => void;
  onMoveToWishlist?: () => void;
  isBusy?: boolean;
};

export function CartItem({ item, onIncrease, onDecrease, onRemove, onMoveToWishlist, isBusy = false }: CartItemProps) {
  const lineTotal = item.product.price * item.quantity;

  return (
    <article className="overflow-hidden rounded-3xl border border-black/10 bg-white/90 p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[118px_1fr]">
        <Link href={`/products/${item.product.slug}`} className="block overflow-hidden rounded-2xl bg-stone-100">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="h-[118px] w-full object-cover transition duration-500 hover:scale-105 sm:w-[118px]"
          />
        </Link>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link href={`/products/${item.product.slug}`} className="font-heading text-xl leading-tight text-royal-800 hover:underline">
                {item.product.name}
              </Link>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-royal-700/65">{item.product.metalType}</p>
            </div>
            <p className="text-base font-semibold text-royal-800">{formatCurrency(lineTotal)}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-royal-700/75 sm:grid-cols-4">
            <div className="rounded-lg border border-black/10 bg-[#fbf7f1] px-2 py-1.5">SKU: {item.product.sku}</div>
            <div className="rounded-lg border border-black/10 bg-[#fbf7f1] px-2 py-1.5">Weight: {item.product.weight}</div>
            <div className="rounded-lg border border-black/10 bg-[#fbf7f1] px-2 py-1.5">Stone: {item.product.gemstone}</div>
            <div className="rounded-lg border border-black/10 bg-[#fbf7f1] px-2 py-1.5">Cert: {item.product.certification}</div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-full border border-black/12 bg-white p-1">
              <button
                type="button"
                onClick={onDecrease}
                disabled={isBusy}
                className="h-7 w-7 rounded-full text-sm text-royal-700 transition hover:bg-stone-100"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="min-w-8 px-2 text-center text-sm font-medium text-royal-800">{item.quantity}</span>
              <button
                type="button"
                onClick={onIncrease}
                disabled={isBusy}
                className="h-7 w-7 rounded-full text-sm text-royal-700 transition hover:bg-stone-100"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onMoveToWishlist}
                disabled={isBusy}
                className="rounded-full border border-black/12 bg-white px-3 py-1.5 text-xs text-royal-700 transition hover:border-royal-700 disabled:opacity-60"
              >
                Move to Wishlist
              </button>
              <button
                type="button"
                onClick={onRemove}
                disabled={isBusy}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
