"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { SafeImage } from "@/components/ui/SafeImage";
import type { CartLine } from "@/lib/types";
import { isSignatureProductSlug } from "@/lib/signature-piece";

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
  const isSignature = Boolean(item.product.isSignature || isSignatureProductSlug(item.product.slug));
  const productHref = isSignature ? `/signature-pieces/${item.product.slug}` : `/products/${item.product.slug}`;
  const detailChips = [
    { label: "SKU", value: item.product.sku },
    { label: "Weight", value: item.product.weight },
    { label: "Stone", value: item.product.gemstone },
    { label: "Cert", value: item.product.certification }
  ].filter((chip) => Boolean(chip.value));

  return (
    <article
      className={`overflow-hidden rounded-3xl border p-4 shadow-sm ${
        isSignature
          ? "border-[#1a3888]/25 bg-gradient-to-r from-[#0b2368] via-[#123683] to-[#0d255f] text-white"
          : "border-black/10 bg-white/90"
      }`}
    >
      <div className="grid gap-4 sm:grid-cols-[118px_1fr]">
        <Link href={productHref} className="block overflow-hidden rounded-2xl bg-stone-100">
          <SafeImage
            src={item.product.image}
            alt={item.product.name}
            className="h-[118px] w-full object-cover transition duration-500 hover:scale-105 sm:w-[118px]"
          />
        </Link>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              {isSignature ? (
                <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-[#d8b16b] bg-[#0b1f5b]/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#f3d28f]">
                  <Crown size={10} />
                  Signature Piece
                </span>
              ) : null}
              <Link
                href={productHref}
                className={`font-heading text-xl leading-tight hover:underline ${
                  isSignature ? "text-[#f4ebde]" : "text-royal-800"
                }`}
              >
                {item.product.name}
              </Link>
              <p
                className={`mt-1 text-xs uppercase tracking-[0.16em] ${
                  isSignature ? "text-[#dfcaac]/85" : "text-royal-700/65"
                }`}
              >
                {item.product.metalType}
              </p>
            </div>
            <p className={`text-base font-semibold ${isSignature ? "text-[#f8ebd5]" : "text-royal-800"}`}>
              {formatCurrency(lineTotal)}
            </p>
          </div>

          {detailChips.length ? (
            <div
              className={`grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 ${
                isSignature ? "text-[#d7c8af]/95" : "text-royal-700/75"
              }`}
            >
              {detailChips.map((chip) => (
                <div
                  key={chip.label}
                  className={`rounded-lg px-2 py-1.5 ${
                    isSignature ? "border border-[#d5b77f]/35 bg-[#0b1e56]/65" : "border border-black/10 bg-[#fbf7f1]"
                  }`}
                >
                  {chip.label}: {chip.value}
                </div>
              ))}
            </div>
          ) : null}

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
                className={`rounded-full border px-3 py-1.5 text-xs transition disabled:opacity-60 ${
                  isSignature
                    ? "border-[#d8b16b]/45 bg-[#0b1f58] text-[#f1d7aa] hover:border-[#d8b16b]"
                    : "border-black/12 bg-white text-royal-700 hover:border-royal-700"
                }`}
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
