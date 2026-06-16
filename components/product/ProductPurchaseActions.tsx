"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Heart, Loader2 } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";

type ProductPurchaseActionsProps = {
  productSlug: string;
  productName: string;
  sizeOptions: string[];
  showSizeSelector?: boolean;
  theme?: "default" | "signature";
};

type Notice = {
  type: "success" | "error";
  text: string;
};

export function ProductPurchaseActions({
  productSlug,
  productName,
  sizeOptions,
  showSizeSelector = false,
  theme = "default"
}: ProductPurchaseActionsProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] ?? "");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [cartCount, setCartCount] = useState<number | null>(null);

  const loginRedirect = useMemo(() => `/login?next=${encodeURIComponent(`/products/${productSlug}`)}`, [productSlug]);

  const handleAddToCart = async (mode: "cart" | "buy-now") => {
    if (mode === "cart") {
      setIsAddingToCart(true);
    } else {
      setIsBuyingNow(true);
    }

    setNotice(null);

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          quantity: 1,
          size: showSizeSelector ? selectedSize : undefined
        })
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push(loginRedirect);
        return;
      }

      if (!res.ok || !data?.success) {
        setNotice({
          type: "error",
          text: data?.message || "Unable to update cart right now."
        });
        return;
      }

      setCartCount(Number(data?.cartCount ?? 0));
      setNotice({
        type: "success",
        text:
          mode === "buy-now"
            ? `${productName} added. Redirecting to checkout...`
            : `${productName} added to your bag.`
      });

      if (mode === "buy-now") {
        router.push("/checkout");
      }
    } catch {
      setNotice({
        type: "error",
        text: "Could not connect. Please try again."
      });
    } finally {
      setIsAddingToCart(false);
      setIsBuyingNow(false);
    }
  };

  const handleWishlist = async () => {
    setIsWishlisting(true);
    setNotice(null);

    try {
      const res = await fetch("/api/account/wishlist/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug })
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push(loginRedirect);
        return;
      }

      if (!res.ok || !data?.success) {
        setNotice({
          type: "error",
          text: data?.message || "Unable to add to wishlist."
        });
        return;
      }

      setWishlisted(true);
      setNotice({
        type: "success",
        text: `${productName} saved to wishlist.`
      });
    } catch {
      setNotice({
        type: "error",
        text: "Could not connect. Please try again."
      });
    } finally {
      setIsWishlisting(false);
    }
  };

  return (
    <div className="space-y-4">
      {showSizeSelector ? (
        <div className="space-y-2">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
              theme === "signature" ? "text-[#d8c39f]" : "text-[#1c1b1b]"
            }`}
          >
            Select Size
          </p>
          <CustomSelect
            value={selectedSize}
            onValueChange={setSelectedSize}
            options={sizeOptions.map((option) => ({ value: option, label: option }))}
            buttonClassName={`h-[46px] w-full rounded-none border px-4 text-[15px] ${
              theme === "signature"
                ? "border-[#d3b37a]/55 bg-[#0d286f] text-[#f7ecd7] focus:ring-1 focus:ring-[#d3b37a]"
                : "border-stone-300/90 bg-white text-[#1d2026] focus:ring-1 focus:ring-[#775a19]"
            }`}
            menuClassName="w-full"
          />
        </div>
      ) : null}

      <div className="space-y-3 pt-2">
        <div className="flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => void handleAddToCart("cart")}
            disabled={isAddingToCart || isBuyingNow || isWishlisting}
            className={`group relative h-[44px] flex-1 overflow-hidden px-5 text-[11px] font-semibold uppercase tracking-[0.24em] transition disabled:cursor-not-allowed disabled:opacity-70 ${
              theme === "signature"
                ? "border border-[#d8b16b] bg-gradient-to-r from-[#0a1d5f] via-[#11358a] to-[#0a1d5f] text-[#f6d9a7] hover:brightness-110"
                : "bg-black text-white hover:bg-[#151515]"
            }`}
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              {isAddingToCart ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isAddingToCart ? "Adding..." : "Add to Bag"}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
          </button>

          <button
            type="button"
            onClick={() => void handleWishlist()}
            disabled={isAddingToCart || isBuyingNow || isWishlisting}
            aria-label={wishlisted ? "Saved to wishlist" : "Add to wishlist"}
            className={`flex h-[44px] w-[44px] items-center justify-center border transition ${
              wishlisted
                ? theme === "signature"
                  ? "border-[#d8b16b] bg-[#1c3278] text-[#f7d79e]"
                  : "border-[#b58a54] bg-[#f4ead9] text-[#8a673d]"
                : theme === "signature"
                  ? "border-[#d8b16b]/70 bg-[#0b235f] text-[#f5ddb4] hover:border-[#d8b16b] hover:text-[#ffdca8]"
                  : "border-stone-300/90 bg-white text-[#171a20] hover:border-[#b58a54] hover:text-[#8a673d]"
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {isWishlisting ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : wishlisted ? (
              <Check className="h-4.5 w-4.5" />
            ) : (
              <Heart className="h-4.5 w-4.5" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => void handleAddToCart("buy-now")}
          disabled={isAddingToCart || isBuyingNow || isWishlisting}
          className={`group relative h-[44px] w-full overflow-hidden px-5 text-[11px] font-semibold uppercase tracking-[0.24em] transition disabled:cursor-not-allowed disabled:opacity-70 ${
            theme === "signature"
              ? "border border-[#d8b16b] bg-[#f1dfbf] text-[#2a1b00] hover:bg-[#e8d4ad]"
              : "bg-[#d8bb79] text-[#261900] hover:bg-[#cfb06a]"
          }`}
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            {isBuyingNow ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isBuyingNow ? "Redirecting..." : "Buy Now"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100" />
        </button>
      </div>

      {notice ? (
        <div
          className={`rounded-xl border px-3 py-2 text-xs ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-800"
              : "border-rose-200 bg-rose-50/80 text-rose-700"
          }`}
        >
          {notice.text}
          {notice.type === "success" && typeof cartCount === "number" ? (
            <span className="ml-1 text-[#6b6f78]">Cart items: {cartCount}</span>
          ) : null}
          {notice.type === "success" && !isBuyingNow ? (
            <Link href="/cart" className="ml-2 font-medium underline underline-offset-2">
              View cart
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
