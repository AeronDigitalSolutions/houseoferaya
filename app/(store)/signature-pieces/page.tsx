import Link from "next/link";
import { Crown, ChevronLeft, ChevronRight, Plus, ShieldCheck, Sparkles, Stars } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatCurrency } from "@/lib/format";
import { resolveImageUrlWithFallback } from "@/lib/image-url";
import { getStorefrontGemstone, getStorefrontWeight } from "@/lib/product-materials";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 9;

export default async function SignaturePiecesPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const totalItems = await prisma.product.count({
    where: {
      isActive: true,
      slug: { startsWith: "signature-" }
    }
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const signatureProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      slug: { startsWith: "signature-" }
    },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: productPricingSelect
  });

  const items: Product[] = await Promise.all(
    signatureProducts.map(async (product) => {
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
        gemstone: getStorefrontGemstone(product),
        weight: getStorefrontWeight(product),
        certification: product.certification || "In-house Certified",
        categoryId: product.categoryId,
        image: await resolveImageUrlWithFallback(product.images[0]?.url, null),
        isActive: product.isActive,
        isSignature: true
      };
    })
  );

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-[#070f22] text-[#f5efe6]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_0,rgba(255,255,255,0.02)_24%,transparent_24%,transparent_50%,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.02)_74%,transparent_74%,transparent_100%),radial-gradient(circle_at_20%_10%,rgba(26,51,120,0.48),transparent_32%),radial-gradient(circle_at_78%_22%,rgba(10,28,78,0.72),transparent_40%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#8f7550]/55 bg-[linear-gradient(135deg,rgba(11,31,83,0.96),rgba(12,26,68,0.96))] px-6 py-8 shadow-[0_28px_70px_rgba(0,0,0,0.45)] sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(96,124,210,0.22),transparent_28%),radial-gradient(circle_at_82%_72%,rgba(20,36,84,0.42),transparent_40%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#9f865f] bg-[#0a173b]/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#dbc296]">
                <Crown size={14} />
                Signature Collection
              </p>

              <div className="space-y-2">
                <h1 className="font-heading text-4xl leading-[0.98] text-[#f7f1e8] sm:text-6xl">
                  House of Eraya
                  <span className="mt-2 block italic text-[#d7c09d]">Signature Pieces</span>
                </h1>
                <p className="max-w-2xl text-sm leading-8 text-[#cad2e4] sm:text-base">
                  A refined edit of ceremonial silhouettes, collector stones, and precision-set signatures curated
                  for our most elevated clients.
                </p>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-[#8d7450]/50 bg-[#09132d]/82 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.34)] backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-[#d8bf98]">Collection Notes</p>
              <div className="mt-4 h-px bg-gradient-to-r from-[#8d7450]/0 via-[#8d7450]/60 to-[#8d7450]/0" />
              <ul className="mt-5 space-y-4 text-sm leading-6 text-[#ecedea]">
                <li className="flex items-start gap-3">
                  <Sparkles size={15} className="mt-1 shrink-0 text-[#d6c09b]" />
                  Premium navy presentation with warm beige ceremonial accents
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck size={15} className="mt-1 shrink-0 text-[#d6c09b]" />
                  Signature certification, protected checkout, and concierge-ready detail
                </li>
                <li className="flex items-start gap-3">
                  <Stars size={15} className="mt-1 shrink-0 text-[#d6c09b]" />
                  Distinctive gallery cards designed for an ultra-luxury browsing feel
                </li>
              </ul>
              <Link
                href="/collections"
                className="mt-7 inline-flex items-center justify-center rounded-xl border border-[#d6bf97] bg-[#dbc298] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0f1d4b] transition hover:bg-[#e4ceb0]"
              >
                Browse All Collections
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4 border-b border-[#2a3558] pb-5">
            <div className="space-y-2">
              <h2 className="font-heading text-3xl text-[#f6efe5] sm:text-4xl">Signature Product List</h2>
              <p className="text-sm text-[#98a3bc]">Curated masterpieces for the discerning collector</p>
            </div>
            <p className="rounded-full border border-[#7d6947] bg-[#09173a] px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#d3bf9b]">
              {totalItems} premium pieces
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((product) => (
              <Link
                key={product.id}
                href={`/signature-pieces/${product.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.45rem] border border-[#2a3867] bg-[linear-gradient(180deg,#0b132b_0%,#0d1a43_58%,#102050_100%)] shadow-[0_24px_60px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-1.5 hover:border-[#7f6d4d] hover:shadow-[0_28px_72px_rgba(0,0,0,0.42)]"
              >
                <div className="relative aspect-[0.9] overflow-hidden bg-[#081126]">
                  <SafeImage
                    src={product.image}
                    fallbackSrc={null}
                    showMissingPlaceholder
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#081126] via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-md border border-[#88724f] bg-[#111e47]/94 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d3bf9b]">
                    <Crown size={11} />
                    Signature Piece
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-5 px-6 py-5">
                  <div className="space-y-2">
                    <h3 className="font-heading text-[1.9rem] leading-tight text-[#f4eee3]">{product.name}</h3>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-[#cbb48c]">
                      {product.metalType}
                      {product.gemstone ? ` & ${product.gemstone}` : ""}
                    </p>
                  </div>

                  <div className="flex items-end gap-3">
                    <p className="text-[2rem] leading-none text-[#f8f3eb]">{formatCurrency(product.price)}</p>
                    {product.compareAtPrice ? (
                      <p className="pb-1 text-sm text-[#8a96b5] line-through">{formatCurrency(product.compareAtPrice)}</p>
                    ) : null}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[#21315f] pt-5 text-[11px] uppercase tracking-[0.22em] text-[#d7c19e]">
                    <span>View Signature Piece</span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#7d6947] text-[#d7c19e] transition group-hover:bg-[#d7c19e] group-hover:text-[#102050]">
                      <Plus size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex flex-col gap-4 border-t border-[#22315b] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#9aa6c1]">
                Showing{" "}
                <span className="font-semibold text-[#f5efe5]">{(currentPage - 1) * PAGE_SIZE + 1}</span>-
                <span className="font-semibold text-[#f5efe5]">{Math.min(currentPage * PAGE_SIZE, totalItems)}</span> of{" "}
                <span className="font-semibold text-[#f5efe5]">{totalItems}</span> signature pieces
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={currentPage > 2 ? `/signature-pieces?page=${currentPage - 1}` : "/signature-pieces"}
                  aria-disabled={currentPage === 1}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    currentPage === 1
                      ? "pointer-events-none border-[#2d3b66] bg-[#0b1430] text-[#6c7897]"
                      : "border-[#7d6947] bg-[#09173a] text-[#d3bf9b] hover:bg-[#102250]"
                  }`}
                >
                  <ChevronLeft size={14} />
                  Prev
                </Link>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={pageNumber === 1 ? "/signature-pieces" : `/signature-pieces?page=${pageNumber}`}
                    className={`inline-flex min-w-10 items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                      pageNumber === currentPage
                        ? "border border-[#d3bf9b] bg-[#d3bf9b] text-[#10204a]"
                        : "border border-[#2d3b66] bg-[#09173a] text-[#d6dde8] hover:border-[#7d6947] hover:text-[#f5efe5]"
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ))}

                <Link
                  href={`/signature-pieces?page=${currentPage + 1}`}
                  aria-disabled={currentPage >= totalPages}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    currentPage >= totalPages
                      ? "pointer-events-none border-[#2d3b66] bg-[#0b1430] text-[#6c7897]"
                      : "border-[#7d6947] bg-[#09173a] text-[#d3bf9b] hover:bg-[#102250]"
                  }`}
                >
                  Next
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
