"use client";

import { motion } from "framer-motion";
import { Gem, ShieldCheck, Sparkles } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const storyParagraphs = [
  `House of Eraya did not start in a boardroom. It started with conversations between two cousins, Akshat Raj Baranwal and Shubhankar Baranwal, who kept noticing one common problem: people want to look stylish every day, not just on occasions, but the market was not truly supporting that need.`,
  `Jewelry often felt either too expensive for daily wear or too low in quality to trust. Designs also felt repetitive, outdated, or disconnected from how the new generation expresses itself. Instead of ignoring this gap, they built a brand around solving it.`,
  `Akshat, closely tuned to trends and consumer behavior, took charge of the customer-facing side: marketing, communication, and understanding what people actually want to wear. Shubhankar, with a strong command over numbers and systems, led sourcing, raw materials, and operational structure to keep creativity commercially sound.`,
  `The core idea was simple: looking good every day should not feel expensive or compromised. House of Eraya follows a practical path with modern, trend-led designs in 9kt, 14kt, and 18kt gold so jewelry remains wearable, value-driven, and relevant.`,
  `The journey includes real startup challenges: limited resources, uncertainty, and the constant effort to build trust. Those pressures shaped the brand's focus and discipline instead of slowing it down.`,
  `"Eraya," inspired by Sanskrit meaning "Fortune's Favourite," represents inclusivity and self-expression. It is a house where style is not restricted by budget, background, or stereotypes.`,
  `House of Eraya is not only about jewelry. It is about how people feel when they wear it: confident, distinct, effortless, and fully themselves. The long-term vision is to become India's trusted everyday jewelry brand, chosen not occasionally, but daily.`
];

export default function AboutUsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-1 pb-8 sm:space-y-14">
      <motion.section
        variants={reveal}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2rem] border border-[#d9c39a]/45 bg-[linear-gradient(130deg,#f9f3e8_0%,#f3ebdc_45%,#ede4d2_100%)] p-6 shadow-[0_30px_70px_rgba(82,57,24,0.16)] sm:p-10"
      >
        <div className="pointer-events-none absolute -left-24 top-12 h-52 w-52 rounded-full bg-white/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[#e7d0aa]/65 blur-3xl" />

        <div className="relative grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d7bc8c] bg-[#fff8eb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a6630]">
              <Sparkles size={13} />
              Founders' Journey
            </p>
            <h1 className="font-heading text-[2.2rem] leading-[1.04] text-[#1f1b16] sm:text-[3.25rem]">
              House of Eraya
            </h1>
            <p className="max-w-xl text-[15px] leading-7 text-[#5d564a] sm:text-[17px]">
              A focused story of design, discipline, and everyday luxury built for modern expression.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#dcc39d] bg-white/65 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#8b6a37]">Design Ethos</p>
                <p className="mt-1 text-sm font-medium text-[#27221c]">Quiet Luxury</p>
              </div>
              <div className="rounded-2xl border border-[#dcc39d] bg-white/65 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#8b6a37]">Form Language</p>
                <p className="mt-1 text-sm font-medium text-[#27221c]">Minimal Form</p>
              </div>
              <div className="rounded-2xl border border-[#dcc39d] bg-white/65 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#8b6a37]">Brand Promise</p>
                <p className="mt-1 text-sm font-medium text-[#27221c]">Maximum Presence</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="col-span-2 overflow-hidden rounded-[1.6rem] border border-[#d6bf96]/65 bg-stone-100 shadow-[0_18px_42px_rgba(63,41,16,0.18)]">
              <SafeImage
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=80"
                alt="Jewelry artistry"
                className="h-[240px] w-full object-cover sm:h-[280px]"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#d6bf96]/65 bg-stone-100">
              <SafeImage
                src="https://images.unsplash.com/photo-1588444650733-d53f4f65c2dc?auto=format&fit=crop&w=900&q=80"
                alt="Fine details"
                className="h-[130px] w-full object-cover sm:h-[150px]"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#d6bf96]/65 bg-stone-100">
              <SafeImage
                src="https://images.unsplash.com/photo-1619119069152-a2b331eb392a?auto=format&fit=crop&w=900&q=80"
                alt="Modern luxury"
                className="h-[130px] w-full object-cover sm:h-[150px]"
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.aside
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="h-fit rounded-[1.8rem] border border-[#d9c7aa]/60 bg-white/70 p-6 shadow-[0_14px_40px_rgba(66,48,26,0.1)] lg:sticky lg:top-28"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a6735]">Core Statement</p>
          <p className="mt-3 font-heading text-[2rem] leading-tight text-[#1f1a15]">
            Looking good every day should not feel expensive or compromised.
          </p>
          <div className="mt-6 space-y-3 text-sm text-[#595247]">
            <p className="inline-flex items-center gap-2">
              <Gem size={15} className="text-[#9b7640]" />
              Modern designs in 9kt, 14kt, and 18kt gold
            </p>
            <p className="inline-flex items-center gap-2">
              <ShieldCheck size={15} className="text-[#9b7640]" />
              Wearable, value-driven, and trust-oriented
            </p>
            <p className="inline-flex items-center gap-2">
              <Sparkles size={15} className="text-[#9b7640]" />
              Built on purpose, not trend-chasing
            </p>
          </div>
        </motion.aside>

        <div className="space-y-4">
          {storyParagraphs.map((paragraph, index) => (
            <motion.article
              key={index}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.42, ease: "easeOut", delay: index * 0.03 }}
              className="rounded-2xl border border-stone-200/75 bg-white/80 p-5 text-[15px] leading-8 text-[#44413a] shadow-[0_8px_24px_rgba(78,60,31,0.08)]"
            >
              {paragraph}
            </motion.article>
          ))}

          <motion.article
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.22 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border border-[#d8be8f] bg-[linear-gradient(140deg,#fff8ea_0%,#f8ebd1_100%)] p-5"
          >
            <p className="font-heading text-2xl text-[#2b2216]">Built on chaos and clarity. Driven by purpose. Made for you.</p>
          </motion.article>
        </div>
      </section>
    </div>
  );
}
