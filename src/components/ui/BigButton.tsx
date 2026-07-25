"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { playPop } from "@/lib/sounds";
import { speak } from "@/lib/speech";

interface BigButtonProps {
  children: ReactNode;
  onClick?: () => void;
  /** Spoken aloud on tap, before onClick — voice-first navigation. */
  speakText?: string;
  color?: string;
  colorDeep?: string;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

/** Large, chunky, joyful button — minimum 64px touch target everywhere. */
export function BigButton({
  children,
  onClick,
  speakText,
  color = "#ffc93c",
  colorDeep = "#f5a623",
  className = "",
  ariaLabel,
  disabled = false,
}: BigButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      className={`btn-chunky min-h-16 rounded-bubble px-6 py-3 text-xl font-bold text-white shadow-lg disabled:opacity-50 ${className}`}
      style={{ backgroundColor: color, borderBottomColor: colorDeep }}
      onClick={() => {
        if (disabled) return;
        playPop();
        if (speakText) speak(speakText);
        onClick?.();
      }}
    >
      {children}
    </motion.button>
  );
}
