"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { revealUp, staggerWrap } from "@/lib/animations";
import { collections } from "@/lib/data";

export function FeaturedCollections() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 md:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Curated Edit"
          title="Featured Collections"
          description="A restrained mix of sculptural earrings, rings, and drops designed for lasting relevance."
        />

        <motion.div
          variants={staggerWrap}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          {collections.map((collection) => (
            <motion.article
              key={collection.name}
              variants={revealUp}
              className="group overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/45 shadow-luxe"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  width={1000}
                  height={1200}
                  className="h-[18rem] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[24rem]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="font-heading text-[1.85rem] leading-none text-royal-800">{collection.name}</h3>
                <p className="mt-2 text-sm text-royal-700/75">{collection.description}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
