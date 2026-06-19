"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Crown, Gift, ShieldCheck, Sparkles } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatCurrency } from "@/lib/format";
import { products as fallbackProducts } from "@/lib/mock-data";
import { useCenterReveal } from "@/lib/use-center-reveal";
import type { Product } from "@/lib/types";

type SignatureHighlightProps = {
  products?: Product[];
};

const AUTO_ADVANCE_MS = 5200;

function summarizeProduct(product: Product) {
  const cleaned = product.description?.trim();
  if (!cleaned) {
    return "A collector-grade signature piece designed for elevated occasions.";
  }

  if (/placeholder/i.test(cleaned)) {
    return "A refined signature piece curated for elevated styling and standout presence.";
  }

  return cleaned;
}

export function SignatureHighlight({ products = [] }: SignatureHighlightProps) {
  const { ref, isCentered } = useCenterReveal<HTMLDivElement>();
  const displayProducts = useMemo(() => {
    const source =
      products.length > 0 ? products : fallbackProducts.filter((product) => product.isSignature).slice(0, 4);

    return source.slice(0, 4);
  }, [products]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isCentered || displayProducts.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % displayProducts.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [isCentered, displayProducts.length]);

  useEffect(() => {
    if (activeIndex >= displayProducts.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, displayProducts.length]);

  if (displayProducts.length === 0) return null;

  const activeProduct = displayProducts[activeIndex];
  const activeDescription = summarizeProduct(activeProduct);
  const productHref = `/signature-pieces/${activeProduct.slug}`;

  return (
    <section ref={ref} className="relative overflow-hidden bg-[linear-gradient(180deg,#0b1530_0%,#11214a_52%,#0c1734_100%)] px-4 py-10 sm:px-8 sm:py-12 lg:px-14 lg:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(70,94,154,0.16),transparent_28%),radial-gradient(circle_at_83%_76%,rgba(201,164,96,0.08),transparent_36%),linear-gradient(90deg,rgba(255,255,255,0.02)_0,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_25%),linear-gradient(rgba(255,255,255,0.018)_0,rgba(255,255,255,0.018)_1px,transparent_1px,transparent_25%)] bg-[length:auto,auto,25%_100%,100%_100%]" />

      <div className="relative mx-auto w-full max-w-[1380px]">
        <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b99759]/72 bg-[#12214a]/88 px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#e3c88d] backdrop-blur-sm">
              <Crown size={14} />
              Signature Pieces
            </div>
            <h2 className="mt-5 font-heading text-[3.15rem] leading-[0.92] tracking-[-0.03em] text-[#f7f1e7] sm:text-[4.7rem]">
              Signature Pieces
            </h2>
            <p className="mt-4 max-w-4xl text-[17px] leading-[1.6] text-white/96 sm:text-[18px]">
              A royal edit of elevated designs with precision finishes, select stones, and ceremonial detailing crafted for our most extraordinary collectors.
            </p>
          </div>

          <Link
            href="/signature-pieces"
            className="inline-flex h-14 items-center justify-center rounded-full border border-[#d0b073] bg-[#ecd59a] px-10 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#1b2957] shadow-[0_14px_28px_rgba(6,14,36,0.24)] transition hover:bg-[#f0dda9]"
          >
            Browse All Signature Pieces
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2.3rem] border border-[#d7c6a8]/38 bg-[#f5f0e7] shadow-[0_28px_58px_rgba(4,10,29,0.22)]">
          <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
            <div className="border-b border-[#ddd0ba]/40 p-5 lg:border-b-0 lg:border-r lg:border-r-[#dfd3bf]/44 lg:p-6">
              <div className="relative overflow-hidden rounded-[1.85rem] border border-[#c5a66f]/36 bg-[#05070f] shadow-[0_20px_38px_rgba(5,10,24,0.22)]">
                <div className="absolute left-7 top-7 z-10 inline-flex items-center gap-2 rounded-[0.95rem] border border-[#d4b16e]/84 bg-[#091332]/84 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#efd094] backdrop-blur-sm">
                  <Crown size={14} />
                  Signature Piece
                </div>

                <div className="relative aspect-video">
                  {displayProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                        index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
                      }`}
                    >
                      <SafeImage
                        src={product.image}
                        fallbackSrc={null}
                        showMissingPlaceholder
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,24,0.06)_0%,rgba(7,11,24,0.12)_52%,rgba(10,18,48,0.42)_100%)]" />
                    </div>
                  ))}
                </div>

                <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-3">
                  {displayProducts.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      aria-label={`Show signature product ${index + 1}`}
                      onClick={() => setActiveIndex(index)}
                      className={`h-3.5 w-3.5 rounded-full border transition ${
                        index === activeIndex
                          ? "border-[#e7c987] bg-[#e7c987] shadow-[0_0_0_5px_rgba(231,201,135,0.12)]"
                          : "border-[#f6eee3]/50 bg-[#f6eee3]/35 hover:border-[#e7c987] hover:bg-[#e7c987]/64"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center bg-[linear-gradient(180deg,#faf5ec_0%,#f3ecdf_100%)] p-8 text-center lg:p-10">
              <div className="mb-5 flex items-center justify-center gap-4 text-[#c6a15f]">
                <span className="h-px w-12 bg-[#ccb175]/58" />
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em]">
                  <Crown size={14} />
                  Signature Piece
                </span>
                <span className="h-px w-12 bg-[#ccb175]/58" />
              </div>

              <div className="relative min-h-[19.5rem]">
                {displayProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                      index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <h3
                      className={`font-heading text-[3rem] italic leading-[0.96] tracking-[-0.03em] text-[#15275d] sm:text-[4.2rem] ${
                        index === activeIndex ? "animate-[signatureInk_1200ms_ease]" : ""
                      }`}
                    >
                      {product.name}
                    </h3>

                    <p className="mx-auto mt-5 max-w-[34rem] text-[18px] leading-[1.64] text-[#455681]">
                      {summarizeProduct(product)}
                    </p>

                    <div className="mt-7 text-[3.15rem] font-semibold tracking-tight text-[#112963] sm:text-[4rem]">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href={productHref}
                  className="inline-flex min-h-[4.2rem] min-w-[19rem] items-center justify-between rounded-full bg-[linear-gradient(90deg,#16295f_0%,#2b45a0_100%)] px-8 text-[13px] font-semibold uppercase tracking-[0.28em] text-[#efcf8d] shadow-[0_18px_32px_rgba(10,25,76,0.18)] transition hover:from-[#122556] hover:to-[#264296]"
                >
                  <span className="inline-flex items-center gap-3">
                    <Crown size={16} />
                    View Piece
                  </span>
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-0 border-t border-[#d9cfbc]/54 bg-[#d3d8e2] text-[#17275d] sm:grid-cols-3">
            <div className="flex items-center gap-4 px-6 py-5 backdrop-blur-sm">
              <div className="rounded-full bg-[#f8f3ea] p-3 text-[#c7a25e] shadow-[0_4px_10px_rgba(10,17,37,0.05)]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-[15px] font-semibold sm:text-[17px]">Premium Quality</div>
                <div className="mt-0.5 text-[13px] text-[#627295] sm:text-[15px]">Finest materials and conflict-free</div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t border-[#d0c0a1]/55 px-6 py-5 sm:border-l sm:border-t-0">
              <div className="rounded-full bg-[#f8f3ea] p-3 text-[#c7a25e] shadow-[0_4px_10px_rgba(10,17,37,0.05)]">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-[15px] font-semibold sm:text-[17px]">Timeless Design</div>
                <div className="mt-0.5 text-[13px] text-[#627295] sm:text-[15px]">Artisan craftsmanship made to last</div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t border-[#d0c0a1]/55 px-6 py-5 sm:border-l sm:border-t-0">
              <div className="rounded-full bg-[#f8f3ea] p-3 text-[#c7a25e] shadow-[0_4px_10px_rgba(10,17,37,0.05)]">
                <Gift size={18} />
              </div>
              <div>
                <div className="text-[15px] font-semibold sm:text-[17px]">Perfect Gift</div>
                <div className="mt-0.5 text-[13px] text-[#627295] sm:text-[15px]">Elegant packaging for life</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes signatureFade {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes signatureInk {
          0% {
            opacity: 0.25;
            clip-path: inset(0 100% 0 0);
            filter: blur(0.6px);
          }
          72% {
            opacity: 1;
            clip-path: inset(0 0 0 0);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            clip-path: inset(0 0 0 0);
            filter: blur(0);
          }
        }
      `}</style>
    </section>
  );
}
