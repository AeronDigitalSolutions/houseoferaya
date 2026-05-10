"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { CartItem } from "@/components/CartItem";
import { EmptyState } from "@/components/EmptyState";
import { OrderSummary } from "@/components/OrderSummary";
import type { CartLine } from "@/lib/types";

const FREE_SHIPPING_THRESHOLD = 100000;

export default function CartPage() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyLineId, setBusyLineId] = useState<string | null>(null);
  const [isClearingCart, setIsClearingCart] = useState(false);

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    [lines]
  );

  const unavailableCount = useMemo(() => lines.filter((line) => line.product.stock < 1).length, [lines]);
  const canCheckout = lines.length > 0 && unavailableCount === 0;

  const dynamicDiscount = useMemo(() => {
    if (appliedCoupon === "ERAYA10") {
      return Math.round(subtotal * 0.1);
    }

    if (appliedCoupon === "LUXE5") {
      return Math.round(subtotal * 0.05);
    }

    return 0;
  }, [appliedCoupon, subtotal]);

  const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 199;
  const freeShippingLeft = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();

      if (res.status === 401) {
        router.push("/login?next=/cart");
        return;
      }

      if (!res.ok || !data?.success) {
        setError(data?.message || "Unable to load cart.");
        return;
      }

      const parsedLines: CartLine[] = (data?.cart?.items || []).map((line: any) => ({
        id: line.id,
        quantity: Number(line.quantity),
        product: {
          id: line.product.id,
          name: line.product.name,
          slug: line.product.slug,
          description: "",
          price: Number(line.product.price),
          compareAtPrice: line.product.compareAtPrice ? Number(line.product.compareAtPrice) : undefined,
          sku: line.product.sku,
          stock: Number(line.product.stock ?? 0),
          metalType: line.product.metalType || "N/A",
          gemstone: line.product.gemstone || "N/A",
          weight: line.product.weight || "N/A",
          certification: line.product.certification || "N/A",
          categoryId: "",
          image: line.product.image || "/assets/collection-aura.jpg",
          isActive: Boolean(line.product.isActive),
          pricingBreakdown: line.product.pricingBreakdown
        }
      }));

      setLines(parsedLines);
    } catch {
      setError("Unable to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCart();
  }, []);

  const updateQuantity = async (id: string, nextQty: number) => {
    if (nextQty < 1) {
      return;
    }

    setBusyLineId(id);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch("/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId: id, quantity: nextQty })
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push("/login?next=/cart");
        return;
      }
      if (!res.ok || !data?.success) {
        setError(data?.message || "Unable to update quantity.");
        return;
      }

      setLines((prev) => prev.map((line) => (line.id === id ? { ...line, quantity: Number(data.item?.quantity) } : line)));
      setStatus(data?.message || "Quantity updated.");
    } catch {
      setError("Unable to update quantity.");
    } finally {
      setBusyLineId(null);
    }
  };

  const removeLine = async (id: string) => {
    setBusyLineId(id);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId: id })
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push("/login?next=/cart");
        return;
      }
      if (!res.ok || !data?.success) {
        setError(data?.message || "Unable to remove item.");
        return;
      }

      setLines((prev) => prev.filter((line) => line.id !== id));
      setStatus(data?.message || "Item removed from cart.");
    } catch {
      setError("Unable to remove item.");
    } finally {
      setBusyLineId(null);
    }
  };

  const clearCart = async () => {
    setIsClearingCart(true);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removeAll: true })
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push("/login?next=/cart");
        return;
      }
      if (!res.ok || !data?.success) {
        setError(data?.message || "Unable to clear cart.");
        return;
      }

      setLines([]);
      setAppliedCoupon(null);
      setCouponCode("");
      setStatus(data?.message || "Cart cleared.");
    } catch {
      setError("Unable to clear cart.");
    } finally {
      setIsClearingCart(false);
    }
  };

  const moveToWishlist = async (lineId: string, productId: string) => {
    setBusyLineId(lineId);
    setError(null);
    setStatus(null);

    try {
      const wishlistRes = await fetch("/api/account/wishlist/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      const wishlistData = await wishlistRes.json();

      if (wishlistRes.status === 401) {
        router.push("/login?next=/cart");
        return;
      }
      if (!wishlistRes.ok || !wishlistData?.success) {
        setError(wishlistData?.message || "Unable to move item to wishlist.");
        return;
      }

      await removeLine(lineId);
      setStatus("Item moved to wishlist.");
    } catch {
      setError("Unable to move item to wishlist.");
    } finally {
      setBusyLineId(null);
    }
  };

  const applyCoupon = () => {
    setError(null);
    setStatus(null);
    const normalized = couponCode.trim().toUpperCase();
    if (normalized === "ERAYA10" || normalized === "LUXE5") {
      setAppliedCoupon(normalized);
      setStatus(`Coupon ${normalized} applied successfully.`);
      return;
    }

    setAppliedCoupon(null);
    setError("Invalid coupon code.");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl text-royal-800 sm:text-4xl">Your Cart</h1>
        <div className="card flex items-center gap-3 p-5 text-sm text-royal-700/80">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your cart...
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl text-royal-800 sm:text-4xl">Your Cart</h1>
        <EmptyState
          title="Your Cart Is Empty"
          description="Start exploring curated pieces and add your favorites to continue checkout."
          actionLabel="Explore Collections"
          actionHref="/collections"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-royal-700/60">Refined Checkout</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-heading text-3xl text-royal-800 sm:text-4xl">Your Cart</h1>
            <button
              type="button"
              onClick={() => void clearCart()}
              disabled={isClearingCart}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.13em] text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
            >
              {isClearingCart ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Clear Cart
            </button>
          </div>
          <p className="text-sm text-royal-700/70">Review details, adjust quantity, and checkout in one smooth flow.</p>
        </header>

        {error ? <div className="card border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
        {status ? <div className="card border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{status}</div> : null}
        {unavailableCount > 0 ? (
          <div className="card border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {unavailableCount} item(s) are currently out of stock. Remove them to continue checkout.
          </div>
        ) : null}

        <section className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-royal-800">Free Insured Shipping Progress</p>
            <p className="text-xs text-royal-700/75">
              {freeShippingLeft > 0
                ? `Add ₹${freeShippingLeft.toLocaleString("en-IN")} more for free shipping`
                : "You unlocked free shipping"}
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#ece5da]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#b99363] to-[#8f6a43] transition-all"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm">
          <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-royal-700/65">Coupon</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-royal-800 outline-none placeholder:text-royal-700/35"
              placeholder="Use ERAYA10 or LUXE5"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="rounded-xl border border-black/12 bg-royal-800 px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-white transition hover:bg-royal-700"
            >
              Apply
            </button>
          </div>
          <p className="mt-2 text-[11px] text-royal-700/65">
            Premium codes available: <span className="font-semibold tracking-[0.08em]">ERAYA10</span>,{" "}
            <span className="font-semibold tracking-[0.08em]">LUXE5</span>
          </p>
        </section>

        <div className="space-y-3">
          {lines.map((line) => (
            <CartItem
              key={line.id}
              item={line}
              isBusy={busyLineId === line.id}
              onIncrease={() => void updateQuantity(line.id, line.quantity + 1)}
              onDecrease={() => void updateQuantity(line.id, line.quantity - 1)}
              onRemove={() => void removeLine(line.id)}
              onMoveToWishlist={() => void moveToWishlist(line.id, line.product.id)}
            />
          ))}
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
        <OrderSummary subtotal={subtotal} shippingCharge={shippingCharge} discount={dynamicDiscount} ctaLabel="Proceed to Checkout" showCta={false} />

        <Link
          href={canCheckout ? "/checkout" : "#"}
          className={`block rounded-full px-4 py-3 text-center text-xs uppercase tracking-[0.14em] transition ${
            canCheckout
              ? "border border-black/12 bg-white text-royal-700 hover:border-royal-700"
              : "cursor-not-allowed border border-black/8 bg-stone-100 text-royal-700/45"
          }`}
          aria-disabled={!canCheckout}
          onClick={(event) => {
            if (!canCheckout) {
              event.preventDefault();
            }
          }}
        >
          Continue to Secure Checkout
        </Link>

        <div className="rounded-2xl border border-black/10 bg-white/80 p-4 text-xs text-royal-700/75">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#9c7346]" />
            Complimentary insured shipping and premium packaging included on eligible orders.
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#9c7346]" />
            Secure checkout with handcrafted order care and quality assurance.
          </div>
        </div>
      </aside>
    </div>
  );
}
