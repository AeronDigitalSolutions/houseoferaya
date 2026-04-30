"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight, Crown, Diamond, Gift, ShieldCheck, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const valueProps = [
  { icon: ShieldCheck, title: "Premium Quality", subtitle: "Finest materials" },
  { icon: Diamond, title: "Timeless Design", subtitle: "Made to last" },
  { icon: Gift, title: "Perfect Gift", subtitle: "Elegant packaging" }
];

export function SignatureHighlight() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [14, -14]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-r from-[#0a1e63] via-[#12358f] to-[#0a236f] px-4 py-10 sm:px-8 sm:py-12 lg:px-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_30%,rgba(163,191,255,0.22),transparent_38%),radial-gradient(circle_at_84%_70%,rgba(255,219,157,0.12),transparent_44%)]" />

      <div className="relative mx-auto w-full max-w-7xl rounded-[2rem] border border-white/45 bg-[#f7f4ef] p-4 shadow-[0_26px_60px_rgba(2,10,34,0.34)] sm:p-6 lg:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
          <motion.div style={{ y }} className="relative overflow-hidden rounded-[1.75rem] border border-[#d8b16b] bg-black shadow-[0_20px_40px_rgba(9,14,34,0.38)]">
            <Image
              src="/assets/signature-ring.jpg"
              alt="Signature ring"
              width={1400}
              height={1000}
              className="h-[20rem] w-full object-cover sm:h-[26rem] lg:h-[34rem]"
            />

            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-[#d6a85f] bg-[#0b1f60]/90 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f1cc8a]">
              <Crown size={14} />
              Signature Piece
            </div>

            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-4">
              <span className="h-3 w-3 rounded-full bg-[#efc26d]" />
              <span className="h-3 w-3 rounded-full bg-white/60" />
              <span className="h-3 w-3 rounded-full bg-white/45" />
              <span className="h-3 w-3 rounded-full bg-white/35" />
            </div>
          </motion.div>

          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.32 }}
            transition={{ duration: 0.65 }}
            className="text-center"
          >
            <div className="mb-3 inline-flex items-center gap-3 text-[#be8d48]">
              <span className="h-px w-7 bg-[#d5b17a]" />
              <Crown size={20} />
              <span className="h-px w-7 bg-[#d5b17a]" />
            </div>

            <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[#6f6253] sm:text-xs">Signature Piece</p>
            <h2 className="font-heading text-[2.45rem] leading-[0.95] text-[#12214d] sm:text-6xl">Vermilion Crown Ring</h2>

            <div className="mx-auto mt-5 flex items-center justify-center gap-3 text-[#c3964e]">
              <span className="h-px w-8 bg-[#d3ae74]" />
              <span className="h-2 w-2 rotate-45 bg-[#c79b55]" />
              <span className="h-px w-8 bg-[#d3ae74]" />
            </div>

            <p className="mx-auto mt-7 max-w-[29rem] text-lg leading-relaxed text-[#2f3d60]">
              A clean regal silhouette balancing softness and structure. Created to sit boldly while remaining refined in
              everyday wear.
            </p>

            <p className="mt-8 font-heading text-6xl leading-none text-[#10214d]">₹1,980</p>

            <div className="mt-9">
              <Link
                href="#"
                className="mx-auto inline-flex w-full max-w-[23rem] items-center justify-between rounded-full border border-[#c99b56] bg-gradient-to-r from-[#0a1e5f] via-[#123c9c] to-[#0b235f] px-8 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#f4efe6] shadow-[0_15px_28px_rgba(11,21,52,0.3)] transition duration-300 hover:-translate-y-0.5"
              >
                <span className="inline-flex items-center gap-3">
                  <ShoppingBag size={18} className="text-[#efc473]" />
                  View Piece
                </span>
                <ChevronRight size={20} className="text-[#efc473]" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 grid gap-4 border-t border-[#ddd4c7] pt-6 sm:grid-cols-3">
          {valueProps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`flex items-start justify-center gap-3 text-center sm:justify-start sm:text-left ${
                  idx < valueProps.length - 1 ? "sm:border-r sm:border-[#d7cebf] sm:pr-4" : ""
                }`}
              >
                <Icon size={24} className="mt-0.5 shrink-0 text-[#c39852]" />
                <div>
                  <p className="text-lg font-semibold text-[#152651]">{item.title}</p>
                  <p className="text-base text-[#4e5870]">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

