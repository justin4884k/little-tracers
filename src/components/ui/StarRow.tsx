"use client";

import { motion } from "framer-motion";

interface StarRowProps {
  earned: number;
  total?: number;
  size?: "sm" | "lg";
  /** Animate stars popping in one by one (celebrations). */
  animate?: boolean;
}

/** 1–3 stars for a lesson. Empty stars are soft outlines, never red or sad. */
export function StarRow({ earned, total = 3, size = "sm", animate = false }: StarRowProps) {
  const dim = size === "lg" ? "text-6xl" : "text-xl";
  return (
    <div className={`flex items-center justify-center gap-1 ${dim}`} aria-label={`${earned} of ${total} stars`}>
      {Array.from({ length: total }, (_, i) => {
        const filled = i < earned;
        return (
          <motion.span
            key={i}
            aria-hidden="true"
            initial={animate ? { scale: 0, rotate: -30 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: animate ? 0.4 + i * 0.35 : 0,
              type: "spring",
              stiffness: 300,
              damping: 12,
            }}
            className={filled ? "" : "opacity-30 grayscale"}
          >
            ⭐
          </motion.span>
        );
      })}
    </div>
  );
}
