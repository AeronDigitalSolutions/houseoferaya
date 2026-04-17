"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/data";

export function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const current = testimonials[active];

  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 md:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <SectionHeading eyebrow="Client Notes" title="Testimonials" align="center" />

        <div className="mt-8 rounded-[1.8rem] border border-black/10 bg-white/60 p-5 shadow-soft sm:p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="grid items-center gap-5 sm:gap-6 md:grid-cols-[130px_1fr]"
            >
              <Image
                src={current.image}
                alt={current.name}
                width={220}
                height={220}
                className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
              />
              <div>
                <p className="font-heading text-[2rem] leading-[0.95] text-royal-800 sm:text-[2.4rem]">“{current.quote}”</p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-royal-700/60 sm:text-xs">{current.name}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                className={`h-1.5 rounded-full transition ${active === index ? "w-7 bg-royal-800" : "w-2.5 bg-royal-700/30"}`}
                aria-label={`Show testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
