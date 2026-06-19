"use client";

import { useEffect, useRef, useState } from "react";

export function useCenterReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isCentered, setIsCentered] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsCentered(true);
      return;
    }

    let hasRevealed = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRevealed) {
          hasRevealed = true;
          setIsCentered(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        threshold: 0.01,
        rootMargin: "-42% 0px -42% 0px"
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, isCentered };
}
