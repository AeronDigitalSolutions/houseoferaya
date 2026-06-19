"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SafeImage } from "@/components/ui/SafeImage";
import { revealUp, staggerWrap } from "@/lib/animations";
import { collections } from "@/lib/data";
import { useCenterReveal } from "@/lib/use-center-reveal";
import type { Category } from "@/lib/types";

type FeaturedCollectionsProps = {
  heading?: string;
  description?: string;
  categories?: Category[];
};

export function FeaturedCollections({
  heading = "Featured Collections",
  description = "A restrained mix of sculptural earrings, rings, and drops designed for lasting relevance.",
  categories: selectedCategories
}: FeaturedCollectionsProps) {
  const displayCategories =
    selectedCategories && selectedCategories.length > 0
      ? selectedCategories
      : collections.map((collection, index) => ({
          id: `fallback-${index}`,
          name: collection.name,
          slug: collection.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: collection.description,
          image: collection.image
        }));
  const { ref, isCentered } = useCenterReveal<HTMLDivElement>();
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 md:py-24 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          ref={ref}
          initial={false}
          animate={isCentered ? "visible" : "hidden"}
          variants={staggerWrap}
          className="relative overflow-hidden rounded-[2rem] border border-[#dcc7a0]/60 bg-[linear-gradient(165deg,#f9f4ea_0%,#f4ede0_35%,#efe6d6_100%)] px-5 py-8 shadow-[0_26px_70px_rgba(80,56,26,0.14)] sm:px-8 sm:py-10 lg:px-10 lg:py-12"
        >
          <div className="pointer-events-none absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-[#ffffffaa] blur-3xl" />
          <div className="pointer-events-none absolute -right-14 top-0 h-44 w-44 rounded-full bg-[#f3dfbe] blur-3xl" />

          <div className="relative">
            <motion.div variants={revealUp}>
              <SectionHeading eyebrow="Curated Edit" title={heading} description={description} />
            </motion.div>

            <motion.div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
              {displayCategories.map((category) => (
                <motion.article key={category.id} variants={revealUp}>
                  <Link
                    href={`/collections/${category.slug}`}
                    className="group block overflow-hidden rounded-[1.6rem] border border-[#d8c5a0]/65 bg-[#f7f1e6] shadow-[0_12px_36px_rgba(86,64,34,0.14)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_46px_rgba(68,47,20,0.18)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <SafeImage
                        src={category.image}
                        fallbackSrc={null}
                        showMissingPlaceholder
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-95" />
                      <div className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/45 bg-black/35 text-white/90 backdrop-blur">
                        <ArrowUpRight size={15} />
                      </div>
                    </div>

                    <div className="space-y-2 px-4 pb-4 pt-3">
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d4be96] bg-[#fff8ec] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8e6a35]">
                        <Sparkles size={11} />
                        Collection
                      </div>
                      <h3 className="font-heading text-[1.65rem] leading-none text-[#1a1a1a]">{category.name}</h3>
                      <p className="text-sm leading-relaxed text-[#5f5a53]">
                        {category.description || "Handpicked pieces curated for modern heirloom dressing."}
                      </p>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
