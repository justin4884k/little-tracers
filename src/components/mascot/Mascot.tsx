"use client";

import { motion } from "framer-motion";
import { speak } from "@/lib/speech";
import { playPop } from "@/lib/sounds";

export type MascotMood = "happy" | "excited" | "cheering" | "encouraging";

interface MascotProps {
  mood?: MascotMood;
  /** What Pip says when tapped. */
  says?: string;
  size?: number;
  className?: string;
}

const MOUTHS: Record<MascotMood, string> = {
  happy: "M38 62 Q50 71 62 62",
  excited: "M36 60 Q50 78 64 60 Z",
  cheering: "M34 58 Q50 82 66 58 Z",
  encouraging: "M40 64 Q50 69 60 64",
};

/**
 * Pip — an original little golden spark with big friendly eyes.
 * Tapping Pip repeats the current instruction out loud (voice-first UX).
 */
export function Mascot({ mood = "happy", says, size = 120, className = "" }: MascotProps) {
  const excitedMode = mood === "cheering" || mood === "excited";

  return (
    <motion.button
      type="button"
      aria-label={says ? `Pip says: ${says}` : "Pip the mascot"}
      className={`select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-sunny rounded-full ${className}`}
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.9, rotate: -6 }}
      animate={
        excitedMode
          ? { y: [0, -14, 0], rotate: [0, -4, 4, 0] }
          : { y: [0, -8, 0] }
      }
      transition={{ duration: excitedMode ? 0.7 : 3, repeat: Infinity, ease: "easeInOut" }}
      onClick={() => {
        playPop();
        if (says) speak(says);
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        {/* glow */}
        <circle cx="50" cy="52" r="46" fill="#ffc93c" opacity="0.25" />
        {/* spark tail */}
        <path
          d="M50 4 L56 16 L44 16 Z"
          fill="#ffc93c"
          stroke="#f5a623"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* body */}
        <circle cx="50" cy="52" r="36" fill="#ffc93c" stroke="#f5a623" strokeWidth="3" />
        {/* cheeks */}
        <circle cx="30" cy="58" r="5.5" fill="#ff7b6b" opacity="0.55" />
        <circle cx="70" cy="58" r="5.5" fill="#ff7b6b" opacity="0.55" />
        {/* eyes */}
        <circle cx="38" cy="46" r="6" fill="#3d3357" />
        <circle cx="62" cy="46" r="6" fill="#3d3357" />
        <circle cx="40" cy="44" r="2" fill="#fff" />
        <circle cx="64" cy="44" r="2" fill="#fff" />
        {/* mouth */}
        <path
          d={MOUTHS[mood]}
          fill={excitedMode ? "#3d3357" : "none"}
          stroke="#3d3357"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* little arms */}
        <path
          d="M15 52 Q8 46 12 40"
          fill="none"
          stroke="#f5a623"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M85 52 Q92 46 88 40"
          fill="none"
          stroke="#f5a623"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </motion.button>
  );
}
