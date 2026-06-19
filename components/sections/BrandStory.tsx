"use client";

import { motion } from "framer-motion";
import { revealUp, staggerWrap } from "@/lib/animations";
import { useCenterReveal } from "@/lib/use-center-reveal";

export function BrandStory() {
  const { ref, isCentered } = useCenterReveal<HTMLDivElement>();

  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 md:py-24">
      <motion.div
        ref={ref}
        initial={false}
        animate={isCentered ? "visible" : "hidden"}
        variants={staggerWrap}
        className="mx-auto w-full max-w-5xl rounded-[1.8rem] border border-black/10 bg-[#262421] px-6 py-12 text-center text-[#f6efe6] shadow-soft sm:px-10 sm:py-16"
      >
        <motion.p variants={revealUp} initial={false}
          className="text-[10px] uppercase tracking-[0.32em] text-[#d6bf9f] sm:text-xs"
        >
          Our Philosophy
        </motion.p>
        <motion.h2 variants={revealUp} initial={false}
          className="mt-4 font-heading text-[2.5rem] leading-[0.9] sm:text-[3.7rem]"
        >
          Quiet Luxury,
          <br />
          Precise Emotion.
        </motion.h2>
        <motion.p variants={revealUp} initial={false}
          className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#efe6d9]/88 sm:text-base"
        >
          House of Eraya creates modern heirloom jewelry through measured design decisions, sculptural balance, and a
          finish language that rewards a closer look.
        </motion.p>
      </motion.div>
    </section>
  );
}
