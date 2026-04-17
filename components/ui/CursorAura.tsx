"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export function CursorAura() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { damping: 34, stiffness: 150 });
  const smoothY = useSpring(y, { damping: 34, stiffness: 150 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX - 110);
      y.set(e.clientY - 110);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      style={{ x: smoothX, y: smoothY }}
      className="pointer-events-none fixed left-0 top-0 z-40 hidden h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(169,137,95,0.22),rgba(169,137,95,0.03)_45%,transparent_70%)] blur-2xl lg:block"
    />
  );
}
