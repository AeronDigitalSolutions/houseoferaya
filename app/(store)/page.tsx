import Link from "next/link";
import { CollectionCard } from "@/components/CollectionCard";
import { categories, products } from "@/lib/mock-data";
import { ProductGrid } from "@/components/ProductGrid";

const quickLinks = [
  { href: "/collections", label: "Collections" },
  { href: "/track-order", label: "Track Order" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/about-us", label: "About Us" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-cancellation-policy", label: "Refund Policy" },
  { href: "/shipping-delivery-policy", label: "Shipping Policy" },
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/admin/products", label: "Admin Products" },
  { href: "/admin/orders", label: "Admin Orders" },
  { href: "/admin/shipments", label: "Admin Shipments" },
  { href: "/admin/payments", label: "Admin Payments" },
  { href: "/admin/customers", label: "Admin Customers" }
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="card grid gap-6 p-6 md:grid-cols-2 md:items-center md:p-10">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Jewelry Ecommerce Scaffold</p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-stone-900">Placeholder Storefront Home</h1>
          <p className="text-sm text-stone-600">
            Production-ready architecture with modular pages, API placeholders, Prisma models, and reusable components.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/collections" className="rounded-full bg-stone-900 px-5 py-2 text-sm text-white">
              Browse Collections
            </Link>
            <Link href="/admin" className="rounded-full border border-stone-300 px-5 py-2 text-sm text-stone-800">
              Open Admin
            </Link>
          </div>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
          <img src="/assets/hero-ring.jpg" alt="Placeholder hero" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-3xl text-stone-900">Shop by Category</h2>
          <Link href="/collections" className="text-sm text-stone-600 underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CollectionCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-3xl text-stone-900">Featured Products</h2>
        <ProductGrid products={products.slice(0, 4)} />
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-3xl text-stone-900">Quick Navigation</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="card rounded-xl px-4 py-3 text-sm text-stone-700 transition hover:-translate-y-0.5 hover:bg-stone-100 hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
