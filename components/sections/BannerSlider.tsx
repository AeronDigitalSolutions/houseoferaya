"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const desktopBanners = [
  "/assets/banner/banner%201.png",
  "/assets/banner/banner%202.png",
  "/assets/banner/banner%203.png"
];

const mobileBanners = [
  "/assets/banner/banner%20m1.png",
  "/assets/banner/banner%20m2.png",
  "/assets/banner/banner%20m3.png"
];

const SLIDE_INTERVAL_MS = 4200;

type BannerSliderProps = {
  immersive?: boolean;
};

export function BannerSlider({ immersive = false }: BannerSliderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % desktopBanners.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const scrollToContent = () => {
    const section = document.getElementById("after-banner");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (immersive) {
    return (
      <section className="relative flex min-h-[100svh] w-full items-start justify-center overflow-hidden bg-gradient-to-b from-[#f7f3ee] via-[#f5efe5] to-[#efe4d1] px-4 pb-8 pt-[90px] sm:px-6 sm:pb-10 sm:pt-[104px] lg:px-10">
        <div className="hidden w-full max-w-[1420px] md:block">
          <div className="rounded-[2.2rem] border border-[#e2c596]/85 bg-gradient-to-br from-[#f9ecda] via-[#dfc097] to-[#b4854e] p-[6px] shadow-[0_22px_60px_rgba(83,62,35,0.28),inset_0_1px_0_rgba(255,250,242,0.7)]">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.95rem] bg-black">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`desktop-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={desktopBanners[index]}
                    alt={`House of Eraya banner ${index + 1}`}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="(min-width: 1024px) 88vw, 96vw"
                  />
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={scrollToContent}
                aria-label="Scroll to next section"
                className="absolute bottom-6 left-1/2 z-10 inline-flex -translate-x-1/2 items-center justify-center rounded-full border border-white/70 bg-[#f8f2e8]/88 p-2.5 text-[#8f6c44] shadow-luxe backdrop-blur transition hover:scale-105 active:scale-95"
              >
                <motion.span
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <ChevronDown size={18} />
                </motion.span>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[430px] md:hidden">
          <div className="rounded-[2rem] border border-[#e2c596]/85 bg-gradient-to-br from-[#f9ecda] via-[#dfc097] to-[#b4854e] p-[5px] shadow-[0_18px_42px_rgba(83,62,35,0.24),inset_0_1px_0_rgba(255,250,242,0.7)]">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[1.7rem] bg-black">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`mobile-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={mobileBanners[index]}
                    alt={`House of Eraya mobile banner ${index + 1}`}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="94vw"
                  />
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={scrollToContent}
                aria-label="Scroll to next section"
                className="absolute bottom-5 left-1/2 z-10 inline-flex -translate-x-1/2 items-center justify-center rounded-full border border-white/70 bg-[#f8f2e8]/88 p-2.5 text-[#8f6c44] shadow-luxe backdrop-blur transition hover:scale-105 active:scale-95"
              >
                <motion.span
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <ChevronDown size={18} />
                </motion.span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative px-5 pb-8 pt-24 sm:px-8 sm:pt-28 lg:px-12">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[1.9rem] border border-white/70 bg-white/35 shadow-soft">
        <div className="relative hidden h-[72vh] min-h-[420px] md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={`desktop-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={desktopBanners[index]}
                alt={`House of Eraya banner ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative h-[72vh] min-h-[520px] md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`mobile-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={mobileBanners[index]}
                alt={`House of Eraya mobile banner ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={scrollToContent}
          aria-label="Scroll to next section"
          className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center justify-center rounded-full border border-white/70 bg-[#f8f2e8]/85 p-2.5 text-[#8f6c44] shadow-luxe backdrop-blur transition hover:scale-105 active:scale-95"
        >
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex"
          >
            <ChevronDown size={18} />
          </motion.span>
        </button>
      </div>
    </section>
  );
}
