import { ProductGrid } from "@/components/ProductGrid";
import { products } from "@/lib/mock-data";

export default function WishlistPage() {
  return (
    <div className="space-y-5">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Wishlist</h1>
      <p className="text-sm text-stone-600">Placeholder wishlist page with reusable product grid.</p>
      <ProductGrid products={products.slice(0, 3)} />
    </div>
  );
}
