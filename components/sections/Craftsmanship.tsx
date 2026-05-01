"use client";

import { PackageCheck, PenTool, Sparkles, WandSparkles } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { craftsmanshipSteps } from "@/lib/data";

const icons = [PenTool, WandSparkles, Sparkles, PackageCheck];

export function Craftsmanship() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 md:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Atelier Process"
          title="Craftsmanship"
          description="Every step is constrained by proportion, material behavior, and finishing integrity."
          align="center"
        />

        <div className="craftsmanship-cards mt-9 grid gap-4 sm:mt-11 md:grid-cols-2 lg:grid-cols-4">
          {craftsmanshipSteps.map((step, index) => {
            const Icon = icons[index];
            return (
              <motion.article
                key={step.title}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="craftsmanship-card rounded-[1.4rem] border border-black/10 bg-white/55 p-5 shadow-luxe transition duration-300 md:hover:scale-[1.03] sm:p-6"
              >
                <div className="mb-4 inline-flex rounded-full border border-black/10 bg-beige-100 p-2.5 text-royal-800">
                  <Icon size={16} />
                </div>
                <h3 className="font-heading text-[2rem] leading-none text-royal-800">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-royal-700/78">{step.detail}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
