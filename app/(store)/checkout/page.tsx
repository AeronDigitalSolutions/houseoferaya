import { CheckoutForm } from "@/components/CheckoutForm";
import { OrderSummary } from "@/components/OrderSummary";
import { cartItems } from "@/lib/mock-data";

export default function CheckoutPage() {
  const subtotal = cartItems.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Checkout</h1>
        <CheckoutForm />
      </section>

      <div className="space-y-4">
        <OrderSummary subtotal={subtotal} shippingCharge={199} discount={1500} ctaLabel="Place Order" showCta={false} />
        <div className="card p-4 text-sm text-stone-600">
          Shipping charge calculation placeholder. Integrate with shipping provider API at order creation step.
        </div>
      </div>
    </div>
  );
}
