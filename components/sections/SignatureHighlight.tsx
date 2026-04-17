"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TactileButton } from "@/components/ui/TactileButton";

export function SignatureHighlight() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [14, -14]);

  return (
    <section ref={ref} className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 md:py-12">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-7 rounded-[1.7rem] border border-black/10 bg-white/50 p-4 shadow-soft sm:p-6 md:grid-cols-2 md:gap-10 md:p-9">
        <motion.div style={{ y }} className="overflow-hidden rounded-[1.4rem]">
          <Image
            src="/assets/signature-ring.jpg"
            alt="Signature ring"
            width={1200}
            height={1400}
            className="h-[21rem] w-full object-cover sm:h-[30rem]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65 }}
        >
          <SectionHeading eyebrow="Signature Piece" title="Vermilion Crown Ring" />
          <p className="mt-5 text-sm leading-relaxed text-royal-700/78 sm:text-base">
            A clean regal silhouette balancing softness and structure. Created to sit boldly while remaining refined in
            everyday wear.
          </p>
          <p className="mt-4 font-heading text-4xl leading-none text-royal-800">₹1,980</p>
          <div className="mt-6">
            <TactileButton href="#" className="w-full sm:w-auto">
              View Piece
            </TactileButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
