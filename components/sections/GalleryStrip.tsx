"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { galleryImages } from "@/lib/data";
import { revealUp, staggerWrap } from "@/lib/animations";
import { useCenterReveal } from "@/lib/use-center-reveal";

export function GalleryStrip() {
  const { ref, isCentered } = useCenterReveal<HTMLDivElement>();

  return (
    <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12 md:pb-24">
      <motion.div ref={ref} initial={false} animate={isCentered ? "visible" : "hidden"} variants={staggerWrap} className="mx-auto w-full max-w-7xl">
        <p className="mb-5 text-[10px] uppercase tracking-[0.28em] text-royal-700/60 sm:text-xs">Journal Frames</p>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4">
          {galleryImages.map((img, index) => (
            <motion.div
              key={img}
              variants={revealUp}
              className="min-w-[67vw] snap-start overflow-hidden rounded-2xl border border-black/10 bg-white/50 shadow-luxe sm:min-w-[250px]"
            >
              <Image
                src={img}
                alt={`Gallery image ${index + 1}`}
                width={600}
                height={600}
                className="aspect-square w-full object-cover"
                quality={70}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
