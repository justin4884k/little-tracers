"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { playPop } from "@/lib/sounds";
import { stopSpeaking } from "@/lib/speech";

/** Round arrow button, top-left of every child screen. Icon-only, no reading. */
export function BackButton({ href }: { href?: string }) {
  const router = useRouter();
  return (
    <motion.button
      type="button"
      aria-label="Go back"
      whileTap={{ scale: 0.88 }}
      className="btn-chunky flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-3xl shadow-lg border-b-4 border-ink/15"
      onClick={() => {
        playPop();
        stopSpeaking();
        if (href) router.push(href);
        else router.back();
      }}
    >
      <span aria-hidden="true">⬅️</span>
    </motion.button>
  );
}
