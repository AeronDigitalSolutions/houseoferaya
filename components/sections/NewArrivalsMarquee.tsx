import Link from "next/link";
import { products } from "@/lib/mock-data";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";
import { isSignatureProductSlug } from "@/lib/signature-piece";

type NewArrivalsMarqueeProps = {
  products?: Product[];
};

export function NewArrivalsMarquee({ products: arrivalProducts }: NewArrivalsMarqueeProps) {
  const newArrivals = (arrivalProducts && arrivalProducts.length > 0 ? arrivalProducts : products.slice(0, 6)).slice(0, 12);
  const marqueeItems = [...newArrivals, ...newArrivals];
  return (
    <section className="overflow-hidden border-y border-black/10 bg-[#f9f6f1] py-7 sm:py-8">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#6b5e4f] sm:text-xs">New Arrivals</p>
          <Link href="/collections" className="text-[10px] uppercase tracking-[0.2em] text-[#8b704e] sm:text-xs">
            View All
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="new-arrivals-track flex min-w-max items-stretch gap-4 px-5 sm:gap-5 sm:px-8 lg:px-12">
          {marqueeItems.map((product, idx) => (
            <Link
              key={`${product.id}-${idx}`}
              href={isSignatureProductSlug(product.slug) ? `/signature-pieces/${product.slug}` : `/products/${product.slug}`}
              className="group w-[220px] shrink-0 rounded-2xl border border-black/10 bg-white/70 p-3 shadow-[0_8px_20px_rgba(33,29,24,0.06)] transition hover:-translate-y-0.5"
            >
              <div className="aspect-square overflow-hidden rounded-xl bg-stone-100">
                <SafeImage
                  src={product.image}
                  fallbackSrc={null}
                  showMissingPlaceholder
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 truncate font-heading text-lg text-royal-800">{product.name}</p>
              <p className="mt-1 text-sm text-royal-700/80">{formatCurrency(product.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
