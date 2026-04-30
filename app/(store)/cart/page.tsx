import Link from "next/link";
import { CartItem } from "@/components/CartItem";
import { OrderSummary } from "@/components/OrderSummary";
import { cartItems } from "@/lib/mock-data";

export default function CartPage() {
  const subtotal = cartItems.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Cart</h1>

        <div className="card p-4">
          <label className="mb-2 block text-sm text-stone-600">Coupon Code</label>
          <div className="flex gap-2">
            <input className="w-full rounded-lg border border-stone-300 p-2 text-sm" placeholder="Enter coupon" />
            <button className="rounded-lg border border-stone-300 px-4 text-sm">Apply</button>
          </div>
        </div>

        <div className="space-y-3">
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
      </section>

      <div className="space-y-4">
        <OrderSummary subtotal={subtotal} shippingCharge={199} discount={1500} ctaLabel="Proceed to Checkout" />
        <Link href="/checkout" className="block text-center text-sm text-stone-600 underline underline-offset-4">
          Continue to checkout route
        </Link>
      </div>
    </div>
  );
}
