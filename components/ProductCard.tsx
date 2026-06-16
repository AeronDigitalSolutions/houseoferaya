import Link from "next/link";
import { Crown } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";
import { isSignatureProductSlug } from "@/lib/signature-piece";

type ProductCardProps = {
  product: Product;
  fullCardClickable?: boolean;
  hideViewButton?: boolean;
  emphasizeSignature?: boolean;
  linkPrefix?: string | null;
};

export function ProductCard({
  product,
  fullCardClickable = false,
  hideViewButton = false,
  emphasizeSignature = false,
  linkPrefix = null
}: ProductCardProps) {
  const isSignature = Boolean(product.isSignature || isSignatureProductSlug(product.slug));
  const resolvedLinkPrefix = linkPrefix ?? (isSignature ? "/signature-pieces" : "/products");
  const productHref = `${resolvedLinkPrefix}/${product.slug}`;
  const showSignatureAccent = emphasizeSignature && isSignature;

  const mediaAndInfo = (
    <>
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <SafeImage
          src={product.image}
          fallbackSrc={null}
          showMissingPlaceholder
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {showSignatureAccent ? (
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06143f]/55 via-transparent to-transparent" />
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#d8b16b] bg-[#0c276f]/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#f6d28e]">
              <Crown size={11} />
              Signature Piece
            </div>
          </>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className={`font-heading text-lg ${showSignatureAccent ? "text-[#f8f1e2]" : "text-stone-900"}`}>{product.name}</h3>
          <p
            className={`text-xs uppercase tracking-wide ${
              showSignatureAccent ? "text-[#e6cfaa]/85" : "text-stone-500"
            }`}
          >
            {product.metalType}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <p className={`text-sm font-semibold ${showSignatureAccent ? "text-[#f8f1e2]" : "text-stone-900"}`}>
            {formatCurrency(product.price)}
          </p>
          {product.compareAtPrice ? (
            <p className={`text-xs line-through ${showSignatureAccent ? "text-[#d7c7ab]/70" : "text-stone-500"}`}>
              {formatCurrency(product.compareAtPrice)}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );

  if (fullCardClickable) {
    return (
      <Link
        href={productHref}
        className={`group block overflow-hidden transition hover:-translate-y-1 hover:shadow-md ${
          showSignatureAccent
            ? "rounded-2xl border border-[#17398f]/25 bg-gradient-to-b from-[#0b2368] via-[#112d80] to-[#0a1f5b] text-white shadow-[0_24px_45px_rgba(8,19,62,0.25)]"
            : "card"
        }`}
      >
        {mediaAndInfo}
      </Link>
    );
  }

  return (
    <article
      className={`group overflow-hidden transition hover:-translate-y-1 hover:shadow-md ${
        showSignatureAccent
          ? "rounded-2xl border border-[#17398f]/25 bg-gradient-to-b from-[#0b2368] via-[#112d80] to-[#0a1f5b] text-white shadow-[0_24px_45px_rgba(8,19,62,0.25)]"
          : "card"
      }`}
    >
      <Link href={productHref} className="block">
        {mediaAndInfo}
      </Link>

      {!hideViewButton ? (
        <div className="p-4 pt-0">
          <Link
            href={productHref}
            className={`inline-flex rounded-full border px-4 py-2 text-xs font-medium transition ${
              showSignatureAccent
                ? "border-[#d8b16b]/75 bg-[#0c276f] text-[#f7d79e] hover:bg-[#163a95]"
                : "border-stone-300 text-stone-800 hover:border-stone-800 hover:text-stone-900"
            }`}
          >
            View Product
          </Link>
        </div>
      ) : null}
    </article>
  );
}
