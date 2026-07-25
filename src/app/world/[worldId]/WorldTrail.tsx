"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { World } from "@/data/worlds";
import { useProgressStore } from "@/store/progressStore";
import { BackButton } from "@/components/ui/BackButton";
import { Mascot } from "@/components/mascot/Mascot";
import { StarRow } from "@/components/ui/StarRow";
import { GlyphPreview } from "@/components/ui/GlyphPreview";
import { playPop } from "@/lib/sounds";
import { speak } from "@/lib/speech";

/** A winding trail of lesson nodes. Nothing is ever locked — order is a
 *  suggestion (the next fresh lesson pulses), curiosity is welcome. */
export function WorldTrail({ world }: { world: World }) {
  const router = useRouter();
  const progress = useProgressStore((s) => s.progress);

  const firstFreshIndex = world.glyphs.findIndex(
    (g) => !(progress[g.id]?.stars ?? 0)
  );

  return (
    <div
      className="min-h-dvh w-full pb-28"
      style={{
        background: `linear-gradient(170deg, ${world.theme.from}, ${world.theme.via}, ${world.theme.to})`,
      }}
    >
      <header className="flex items-center gap-4 p-4">
        <BackButton href="/map" />
        <div className="rounded-bubble bg-white/85 px-6 py-2 shadow-md">
          <h1 className="text-2xl font-extrabold text-ink">
            {world.emoji} {world.name}
          </h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col items-stretch gap-1 px-6">
        {world.glyphs.map((glyph, i) => {
          const stars = progress[glyph.id]?.stars ?? 0;
          const isNextFresh = i === firstFreshIndex;
          const offset = i % 4 < 2 ? (i % 4 === 0 ? "-24%" : "0%") : i % 4 === 2 ? "24%" : "0%";

          return (
            <div key={glyph.id} className="flex justify-center">
              <motion.button
                type="button"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: Math.min(i * 0.05, 0.8),
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Trace ${glyph.spoken}. ${stars} stars earned.`}
                className="btn-chunky relative m-2 flex h-24 w-24 flex-col items-center justify-center rounded-full shadow-xl border-b-8"
                style={{
                  translate: offset,
                  backgroundColor: stars > 0 ? world.theme.accent : "#ffffff",
                  borderBottomColor: world.theme.accentDeep,
                }}
                onClick={() => {
                  playPop();
                  speak(`Let's trace ${glyph.spoken}!`);
                  router.push(`/trace/${glyph.id}`);
                }}
              >
                {isNextFresh && <NextUpPulse />}
                {glyph.display ? (
                  <span
                    className="text-5xl font-extrabold"
                    style={{ color: stars > 0 ? "#ffffff" : world.theme.accentDeep }}
                  >
                    {glyph.display}
                  </span>
                ) : (
                  <GlyphPreview
                    glyph={glyph}
                    color={stars > 0 ? "#ffffff" : world.theme.accentDeep}
                    strokeWidth={10}
                    className="h-14 w-14"
                  />
                )}
                <div className="absolute -bottom-2">
                  <div className="rounded-full bg-white/90 px-2 shadow">
                    <StarRow earned={stars} size="sm" />
                  </div>
                </div>
              </motion.button>
            </div>
          );
        })}
      </main>

      <div className="fixed bottom-3 right-3">
        <Mascot
          says={`${world.spokenWelcome} Tap any bubble to trace!`}
          size={84}
        />
      </div>
    </div>
  );
}

/** Gentle "you're up next" halo — an invitation, never a demand. */
function NextUpPulse() {
  return (
    <motion.span
      aria-hidden="true"
      className="absolute inset-0 rounded-full border-4 border-white"
      animate={{ scale: [1, 1.18, 1], opacity: [0.9, 0.2, 0.9] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
