"use client";

import { motion } from "framer-motion";

export function BrandStory() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 md:py-24">
      <div className="mx-auto w-full max-w-5xl rounded-[1.8rem] border border-black/10 bg-[#262421] px-6 py-12 text-center text-[#f6efe6] shadow-soft sm:px-10 sm:py-16">
        <motion.p
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.7 }}
          className="text-[10px] uppercase tracking-[0.32em] text-[#d6bf9f] sm:text-xs"
        >
          Our Philosophy
        </motion.p>
        <motion.h2
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.8, delay: 0.06 }}
          className="mt-4 font-heading text-[2.5rem] leading-[0.9] sm:text-[3.7rem]"
        >
          Quiet Luxury,
          <br />
          Precise Emotion.
        </motion.h2>
        <motion.p
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#efe6d9]/88 sm:text-base"
        >
          House of Eraya creates modern heirloom jewelry through measured design decisions, sculptural balance, and a
          finish language that rewards a closer look.
        </motion.p>
      </div>
    </section>
  );
}
