"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { TactileButton } from "@/components/ui/TactileButton";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-eraya-texture px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-12 md:pt-36">
      <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.68),transparent_40%),radial-gradient(circle_at_20%_85%,rgba(36,34,31,0.1),transparent_46%)]" />

      <div className="relative mx-auto grid w-full max-w-7xl items-end gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-14">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#726453] sm:text-xs">Fine Jewelry Maison</p>
          <h1 className="mt-4 font-heading text-[3.15rem] leading-[0.87] text-royal-800 sm:text-[4.6rem] lg:max-w-xl lg:text-[5.1rem]">
            Minimal Form.
            <br />
            Maximum Presence.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-royal-700/75 sm:text-base">
            Sculpted pieces for modern heirloom wardrobes, precise, tactile, and quietly bold.
          </p>
          <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <TactileButton href="#" className="w-full sm:w-auto">
              Shop Collection
            </TactileButton>
            <TactileButton href="#" variant="secondary" className="w-full sm:w-auto">
              Explore Craft
            </TactileButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.12 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/35 p-2 shadow-soft sm:rounded-[2.3rem]">
            <Image
              src="/assets/hero-earrings.jpg"
              alt="House of Eraya hero piece"
              width={1200}
              height={1500}
              className="h-[24rem] w-full rounded-[1.6rem] object-cover object-center sm:h-[32rem]"
              priority
            />
          </div>
          <div className="absolute -bottom-5 -left-1 w-[74%] overflow-hidden rounded-2xl border border-white/80 bg-[#f7f3ee]/86 p-4 shadow-luxe ring-1 ring-black/10 backdrop-blur-md sm:-left-4 sm:w-[62%]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#faf6ef]/96 via-[#f4eee7]/93 to-[#ebe2d7]/90" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#685744]">New Capsule</p>
              <p className="mt-1 font-heading text-2xl leading-none text-[#1e1c19] sm:text-[1.8rem]">Aureline 06</p>
              <p className="mt-2 text-xs text-[#3d3832] sm:text-sm">Engineered curves with warm gold tonality.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
