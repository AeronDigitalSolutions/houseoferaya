import Link from "next/link";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" }
];

const utilityLinks = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
  { href: "/cart", label: "Cart" }
];

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/collections/rings", label: "Collection Detail (Example)" },
  { href: "/products/celeste-diamond-ring", label: "Product Detail (Example)" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/order-confirmation/ord_1001", label: "Order Confirmation (Example)" },
  { href: "/track-order", label: "Track Order" },
  { href: "/track-order/ord_1001", label: "Track Order Detail (Example)" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/orders/ord_1001", label: "Order Detail (Example)" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-cancellation-policy", label: "Refund & Cancellation" },
  { href: "/shipping-delivery-policy", label: "Shipping & Delivery" },
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/admin/products", label: "Admin Products" },
  { href: "/admin/orders", label: "Admin Orders" },
  { href: "/admin/shipments", label: "Admin Shipments" },
  { href: "/admin/payments", label: "Admin Payments" },
  { href: "/admin/customers", label: "Admin Customers" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/90 backdrop-blur">
      <div className="container-base flex flex-wrap items-center justify-between gap-3 py-4">
        <Link href="/" className="font-heading text-xl font-semibold tracking-wide text-stone-900">
          Jewelry Platform
        </Link>

        <nav className="order-3 flex w-full flex-wrap gap-3 text-sm text-stone-700 md:order-2 md:w-auto md:gap-4">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-stone-950">
              {link.label}
            </Link>
          ))}

          <details className="group relative">
            <summary className="list-none cursor-pointer transition hover:text-stone-950">
              Quick Links
            </summary>
            <div className="absolute left-0 top-7 z-50 w-[min(92vw,420px)] rounded-xl border border-stone-200 bg-white p-3 shadow-lg">
              <div className="grid max-h-80 grid-cols-1 gap-1 overflow-auto md:grid-cols-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-2 py-1.5 text-xs text-stone-700 transition hover:bg-stone-100 hover:text-stone-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </details>
        </nav>

        <div className="order-2 ml-auto flex items-center gap-3 text-sm text-stone-700 md:order-3 md:ml-0">
          {utilityLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-stone-950">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
