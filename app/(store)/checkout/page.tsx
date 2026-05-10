import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderSummary } from "@/components/OrderSummary";
import { redirect } from "next/navigation";
import { getAuthUserFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";

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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Quick Checkout</h1>
        <CheckoutForm />
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
