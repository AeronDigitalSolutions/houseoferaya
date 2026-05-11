import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderSummary } from "@/components/OrderSummary";
import { redirect } from "next/navigation";
import { Crown } from "lucide-react";
import { getAuthUserFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";
import { isSignatureProductSlug } from "@/lib/signature-piece";

const FREE_SHIPPING_THRESHOLD = 100000;

export default async function CheckoutPage() {
  const user = await getAuthUserFromCookies();
  if (!user || !user.isActive) {
    redirect("/login?next=/checkout");
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: productPricingSelect
          }
        }
      }
    }
  });

  const subtotal =
    cart?.items.reduce((sum, line) => {
      const pricing = buildProductPricing(line.product);
      return sum + pricing.finalPrice * line.quantity;
    }, 0) ?? 0;
  const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 199;
  const checkoutItems =
    cart?.items.map((line) => {
      const pricing = buildProductPricing(line.product);
      const isSignature = isSignatureProductSlug(line.product.slug);
      return {
        id: line.id,
        quantity: line.quantity,
        name: line.product.name,
        slug: line.product.slug,
        image: line.product.images[0]?.url || "/assets/collection-aura.jpg",
        isSignature,
        lineTotal: pricing.finalPrice * line.quantity
      };
    }) ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Quick Checkout</h1>
        <CheckoutForm />
        <section className="card space-y-3 p-4 sm:p-5">
          <h3 className="font-heading text-xl text-stone-900">Items in Checkout</h3>
          <div className="space-y-2">
            {checkoutItems.map((item) => (
              <article
                key={item.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                  item.isSignature
                    ? "border-[#1b3d96]/30 bg-gradient-to-r from-[#0a225f] via-[#113282] to-[#0a235f] text-white"
                    : "border-black/10 bg-white"
                }`}
              >
                <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`truncate text-sm font-medium ${item.isSignature ? "text-[#f6ecda]" : "text-stone-900"}`}>
                      {item.name}
                    </p>
                    {item.isSignature ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#d8b16b] bg-[#0b1f59]/75 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#f4d59b]">
                        <Crown size={10} />
                        Signature Piece
                      </span>
                    ) : null}
                  </div>
                  <p className={`text-xs ${item.isSignature ? "text-[#e0cfb2]/85" : "text-stone-600"}`}>Qty: {item.quantity}</p>
                </div>
                <p className={`text-sm font-semibold ${item.isSignature ? "text-[#f5e0b8]" : "text-stone-900"}`}>
                  ₹{item.lineTotal.toLocaleString("en-IN")}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <div className="space-y-4">
        <OrderSummary subtotal={subtotal} shippingCharge={shippingCharge} discount={0} ctaLabel="Place Order" showCta={false} />
        <div className="card p-4 text-sm text-stone-600">
          Shipping calculation and ETA can be auto-fetched from shipping provider API at order creation.
        </div>
      </div>
    </div>
  );
}
