"use client";

import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/data";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <motion.div
        initial={false}
        animate={{
          backgroundColor: isScrolled ? "rgba(247,243,238,0.94)" : "rgba(247,243,238,0.72)",
          borderColor: isScrolled ? "rgba(38,36,33,0.12)" : "rgba(255,255,255,0.42)",
          boxShadow: isScrolled ? "0 10px 30px rgba(36,34,31,0.12)" : "0 6px 22px rgba(36,34,31,0.06)"
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-2xl border px-4 backdrop-blur-xl sm:h-[74px] sm:px-6"
      >
        <Link href="#" className="flex items-center gap-2.5">
          <Image
            src="/assets/logo.jpeg"
            alt="House of Eraya logo"
            width={40}
            height={40}
            className="h-9 w-9 rounded-full border border-white/80 object-cover sm:h-10 sm:w-10"
            priority
          />
          <span className="font-heading text-2xl leading-none tracking-[0.02em] text-royal-800">Eraya</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item}
              href="#"
              className="text-xs uppercase tracking-[0.16em] text-royal-700/75 transition hover:text-royal-800"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 text-royal-700/85 sm:gap-2">
          <button className="hidden rounded-full p-2.5 transition hover:bg-white/70 md:inline-flex" aria-label="Search">
            <Search size={16} />
          </button>
          <button className="rounded-full p-2.5 transition hover:bg-white/70" aria-label="Bag">
            <ShoppingBag size={16} />
          </button>
          <button className="rounded-full p-2.5 transition hover:bg-white/70 md:hidden" onClick={() => setIsOpen((v) => !v)}>
            {isOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10, pointerEvents: isOpen ? "auto" : "none" }}
        transition={{ duration: 0.24 }}
        className="mx-auto mt-2 w-full max-w-7xl rounded-2xl border border-black/10 bg-[#f7f3ee]/98 p-4 shadow-soft backdrop-blur-xl md:hidden"
      >
        <nav className="space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item}
              href="#"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl border border-black/10 bg-white/55 px-4 py-3 text-xs uppercase tracking-[0.2em] text-royal-800"
            >
              {item}
            </Link>
          ))}
        </nav>
      </motion.div>
    </header>
  );
}
