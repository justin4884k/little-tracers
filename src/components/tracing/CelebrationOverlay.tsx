"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { Pet } from "@/data/rewards";
import { Mascot } from "@/components/mascot/Mascot";
import { StarRow } from "@/components/ui/StarRow";
import { BigButton } from "@/components/ui/BigButton";
import { useClientSeed, seededRandom } from "@/lib/useClientSeed";

interface CelebrationOverlayProps {
  stars: number;
  phrase: string;
  newPet: Pet | null;
  hasNext: boolean;
  onAgain: () => void;
  onNext: () => void;
  onPetSeen: () => void;
}

const CONFETTI = ["🎉", "⭐", "✨", "🌟", "🎈", "💛", "🌈", "🎊"];

function ConfettiRain() {
  const seed = useClientSeed();
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        emoji: CONFETTI[i % CONFETTI.length],
        x: seededRandom(seed, i) * 100,
        delay: seededRandom(seed, i + 100) * 0.9,
        duration: 2.2 + seededRandom(seed, i + 200) * 1.6,
        size: 18 + seededRandom(seed, i + 300) * 22,
      })),
    [seed]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, fontSize: p.size }}
          initial={{ y: -60, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0.8], rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

/** Full-screen joy. Always at least one star, always a cheer, never a score-scold. */
export function CelebrationOverlay({
  stars,
  phrase,
  newPet,
  hasNext,
  onAgain,
  onNext,
  onPetSeen,
}: CelebrationOverlayProps) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ConfettiRain />

      <motion.div
        initial={{ scale: 0.6, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="flex flex-col items-center gap-4 rounded-bubble bg-white p-8 shadow-2xl border-4 border-sunny/60 max-w-md w-full"
      >
        <Mascot mood="cheering" says={phrase} size={110} />
        <StarRow earned={stars} size="lg" animate />
        <p className="text-center text-2xl font-bold text-ink">{phrase}</p>

        {newPet && (
          <motion.button
            type="button"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.25, 1] }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex items-center gap-3 rounded-bubble bg-violet/10 px-5 py-3"
            onClick={onPetSeen}
            aria-label={`New friend unlocked: ${newPet.name}`}
          >
            <span className="text-5xl" aria-hidden="true">
              {newPet.emoji}
            </span>
            <span className="text-left text-lg font-bold text-violet-deep">
              New friend!
              <br />
              {newPet.name}
            </span>
          </motion.button>
        )}

        <div className="mt-2 flex w-full flex-col gap-3">
          {hasNext && (
            <BigButton
              color="#4ade80"
              colorDeep="#22c55e"
              speakText="Let's trace the next one!"
              onClick={onNext}
              className="w-full"
              ariaLabel="Next lesson"
            >
              ➡️ Next!
            </BigButton>
          )}
          <BigButton
            color="#8b5cf6"
            colorDeep="#7c3aed"
            speakText="Let's trace it again!"
            onClick={onAgain}
            className="w-full"
            ariaLabel="Trace again"
          >
            🔄 Again!
          </BigButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
