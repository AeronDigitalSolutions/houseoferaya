import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <EmptyState
        title="No Products Yet"
        description="This collection is currently empty. Replace with live catalog data later."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
