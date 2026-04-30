import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group card overflow-hidden transition hover:-translate-y-1 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-stone-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="font-heading text-lg text-stone-900">{product.name}</h3>
          <p className="text-xs uppercase tracking-wide text-stone-500">{product.metalType}</p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-stone-900">{formatCurrency(product.price)}</p>
          {product.compareAtPrice ? (
            <p className="text-xs text-stone-500 line-through">{formatCurrency(product.compareAtPrice)}</p>
          ) : null}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="inline-flex rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-800 transition hover:border-stone-800 hover:text-stone-900"
        >
          View Product
        </Link>
      </div>
    </article>
  );
}
