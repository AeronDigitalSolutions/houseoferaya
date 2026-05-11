import Link from "next/link";
import { Crown, ShieldCheck, Sparkles, Stars } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";
import { SIGNATURE_PRODUCT_SLUGS } from "@/lib/signature-piece";
import type { Product } from "@/lib/types";

export default async function SignaturePiecesPage() {
  const signatureProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ slug: { in: [...SIGNATURE_PRODUCT_SLUGS] } }, { slug: { startsWith: "signature-" } }]
    },
    orderBy: { createdAt: "desc" },
    select: productPricingSelect
  });

  const items: Product[] = signatureProducts.map((product) => {
    const pricing = buildProductPricing(product);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: pricing.finalPrice,
      compareAtPrice: pricing.compareAtPrice ?? undefined,
      sku: product.sku,
      stock: product.stock,
      metalType: product.metalType,
      gemstone: product.gemstone || "N/A",
      weight: product.weight || "N/A",
      certification: product.certification || "In-house Certified",
      categoryId: product.categoryId,
      image: product.images[0]?.url || "/assets/signature-ring.jpg",
      isActive: product.isActive,
      isSignature: true
    };
  });

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#d8b16b]/50 bg-gradient-to-r from-[#081a55] via-[#0e2f84] to-[#0a1d62] px-6 py-10 text-white shadow-[0_24px_48px_rgba(4,14,46,0.42)] sm:px-8 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_25%,rgba(255,219,146,0.2),transparent_38%),radial-gradient(circle_at_84%_70%,rgba(157,183,255,0.18),transparent_44%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d6b478] bg-[#081645]/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f6d89f]">
              <Crown size={14} />
              Signature Collection
            </p>
            <h1 className="font-heading text-4xl leading-[1.02] text-[#f7efe3] sm:text-6xl">House of Eraya Signature Pieces</h1>
            <p className="max-w-2xl text-sm leading-7 text-[#e6d4b1] sm:text-base">
              A royal blue edit of elevated designs with precision finishes, select stones, and ceremonial detailing.
              Crafted as our ultra-luxury segment.
            </p>
          </div>

          <div className="rounded-2xl border border-[#d7b77f]/45 bg-[#0a1e62]/65 p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[#f2d7a2]">Collection Notes</p>
            <ul className="mt-3 space-y-2 text-sm text-[#f6ebd8]">
              <li className="inline-flex items-center gap-2">
                <Sparkles size={15} className="text-[#e6bc6e]" />
                Premium Blue & Gold presentation
              </li>
              <li className="inline-flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#e6bc6e]" />
                Signature certification + protected checkout
              </li>
              <li className="inline-flex items-center gap-2">
                <Stars size={15} className="text-[#e6bc6e]" />
                Standout cards in wishlist and cart
              </li>
            </ul>
            <Link
              href="/collections"
              className="mt-5 inline-flex rounded-full border border-[#d8b16b] bg-[#f2dfbd] px-4 py-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#132252] transition hover:bg-[#ead2a8]"
            >
              Browse All Collections
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-2xl text-[#142556] sm:text-3xl">Signature Product List</h2>
          <p className="rounded-full border border-[#d8b16b]/55 bg-[#f6ebd8] px-4 py-1.5 text-xs uppercase tracking-[0.16em] text-[#725126]">
            {items.length} premium pieces
          </p>
        </div>

        <ProductGrid
          products={items}
          fullCardClickable
          hideViewButton
          emphasizeSignature
          linkPrefix="/signature-pieces"
        />
      </section>
    </div>
  );
}
