"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WORLDS } from "@/data/worlds";
import { getGlyph } from "@/data/worlds";
import { useProgressStore, starsEarned } from "@/store/progressStore";
import { useSettingsStore } from "@/store/settingsStore";
import { completedCountForWorld } from "@/engine/rewards";
import { Mascot } from "@/components/mascot/Mascot";
import { BackButton } from "@/components/ui/BackButton";
import { speak } from "@/lib/speech";
import { playPop } from "@/lib/sounds";

/** The world map — five floating islands, each a doorway to a world. */
export default function MapPage() {
  const router = useRouter();
  const progress = useProgressStore((s) => s.progress);
  const starsSpent = useProgressStore((s) => s.starsSpent);
  const mission = useSettingsStore((s) => s.mission);

  const stars = starsEarned(progress) - starsSpent;
  const missionGlyphs = mission
    .map((id) => getGlyph(id))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));
  const nextMissionGlyph = missionGlyphs.find((g) => !(progress[g.id]?.stars ?? 0));

  useEffect(() => {
    speak("Where shall we go today? Tap an island!", { interrupt: false });
  }, []);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-gradient-to-b from-sky via-[#c7d2fe] to-[#fbcfe8] pb-10">
      <header className="flex items-center justify-between p-4">
        <BackButton href="/" />
        <button
          type="button"
          aria-label={`${stars} stars — visit your treehouse`}
          className="btn-chunky flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-2xl font-extrabold text-ink shadow-lg border-b-4 border-sunny-deep"
          onClick={() => {
            playPop();
            speak("Let's visit your treehouse!");
            router.push("/treehouse");
          }}
        >
          ⭐ {stars}
        </button>
      </header>

      {/* Teacher mission banner */}
      {nextMissionGlyph && (
        <motion.button
          type="button"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="btn-chunky mx-auto mb-2 flex items-center gap-3 rounded-bubble bg-violet px-6 py-3 text-xl font-bold text-white shadow-lg border-b-4 border-violet-deep"
          onClick={() => {
            playPop();
            speak(`Your special mission: trace ${nextMissionGlyph.spoken}!`);
            router.push(`/trace/${nextMissionGlyph.id}`);
          }}
        >
          🎯 Today&apos;s mission!
        </motion.button>
      )}

      <main className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 px-6 sm:grid-cols-2">
        {WORLDS.map((world, i) => {
          const done = completedCountForWorld(world.id, progress);
          const total = world.glyphs.length;
          return (
            <motion.button
              key={world.id}
              type="button"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 150, damping: 15 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`${world.name}. ${done} of ${total} finished.`}
              className="btn-chunky rounded-bubble p-5 text-left shadow-xl border-b-8"
              style={{
                background: `linear-gradient(145deg, ${world.theme.from}, ${world.theme.to})`,
                borderBottomColor: world.theme.accentDeep,
              }}
              onClick={() => {
                playPop();
                speak(world.spokenWelcome);
                router.push(`/world/${world.id}`);
              }}
            >
              <div className="flex items-center gap-4">
                <motion.span
                  aria-hidden="true"
                  className="text-6xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {world.emoji}
                </motion.span>
                <div className="min-w-0">
                  <h2 className="text-2xl font-extrabold leading-tight text-ink">
                    {world.name}
                  </h2>
                  <p className="text-base font-semibold text-ink-soft">{world.tagline}</p>
                </div>
              </div>
              {/* progress dots */}
              <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-white/60">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: world.theme.accentDeep }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(done / total) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                />
              </div>
              <p className="mt-1 text-sm font-bold text-ink-soft">
                {done} / {total} ⭐
              </p>
            </motion.button>
          );
        })}

        {/* Treehouse island */}
        <motion.button
          type="button"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 150, damping: 15 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Your treehouse — pets and prizes"
          className="btn-chunky rounded-bubble bg-gradient-to-br from-[#fed7aa] to-[#fde68a] p-5 text-left shadow-xl border-b-8 border-sunny-deep"
          onClick={() => {
            playPop();
            speak("Welcome to your treehouse! Look at all your prizes!");
            router.push("/treehouse");
          }}
        >
          <div className="flex items-center gap-4">
            <motion.span
              aria-hidden="true"
              className="text-6xl"
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🏡
            </motion.span>
            <div>
              <h2 className="text-2xl font-extrabold leading-tight text-ink">My Treehouse</h2>
              <p className="text-base font-semibold text-ink-soft">Pets, stickers & prizes</p>
            </div>
          </div>
          <p className="mt-4 text-sm font-bold text-ink-soft">Spend your ⭐ here!</p>
        </motion.button>
      </main>

      <div className="fixed bottom-3 right-3">
        <Mascot says="Tap an island to explore! Tap the star button to see your treehouse!" size={84} />
      </div>
    </div>
  );
}
