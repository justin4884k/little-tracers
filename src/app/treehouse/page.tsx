"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DECORATIONS, PETS } from "@/data/rewards";
import { ALL_GLYPHS } from "@/data/worlds";
import { earnedPets } from "@/engine/rewards";
import { useProgressStore, starsEarned } from "@/store/progressStore";
import { BackButton } from "@/components/ui/BackButton";
import { Mascot } from "@/components/mascot/Mascot";
import { GlyphPreview } from "@/components/ui/GlyphPreview";
import { speak } from "@/lib/speech";
import { playPop, playUnlock, playEncourage } from "@/lib/sounds";

type Tab = "house" | "pets" | "stickers";

const TABS: { id: Tab; emoji: string; label: string; spoken: string }[] = [
  { id: "house", emoji: "🏡", label: "Treehouse", spoken: "Your treehouse! Spend stars on fun things!" },
  { id: "pets", emoji: "🐾", label: "Pets", spoken: "Your animal friends!" },
  { id: "stickers", emoji: "✨", label: "Stickers", spoken: "Your sticker book!" },
];

/** The reward hub: pets collected, stickers earned, treehouse decorated. */
export default function TreehousePage() {
  const [tab, setTab] = useState<Tab>("house");

  const progress = useProgressStore((s) => s.progress);
  const starsSpent = useProgressStore((s) => s.starsSpent);
  const owned = useProgressStore((s) => s.ownedDecorations);
  const placed = useProgressStore((s) => s.placedDecorations);
  const activePet = useProgressStore((s) => s.activePet);
  const buyDecoration = useProgressStore((s) => s.buyDecoration);
  const togglePlaced = useProgressStore((s) => s.togglePlaced);
  const setActivePet = useProgressStore((s) => s.setActivePet);

  const available = starsEarned(progress) - starsSpent;
  const myPets = earnedPets(progress);
  const stickers = ALL_GLYPHS.filter((g) => (progress[g.id]?.stars ?? 0) > 0);

  useEffect(() => {
    speak("Welcome to your treehouse! Look at everything you have earned!", {
      interrupt: false,
    });
  }, []);

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-[#fed7aa] via-[#fef3c7] to-[#bbf7d0] pb-10">
      <header className="flex items-center justify-between p-4">
        <BackButton href="/map" />
        <div
          className="rounded-full bg-white/90 px-6 py-3 text-2xl font-extrabold text-ink shadow-lg"
          aria-label={`${available} stars to spend`}
        >
          ⭐ {available}
        </div>
      </header>

      {/* Tab switcher — icon-first, spoken on tap */}
      <nav className="mx-auto mb-4 flex max-w-md justify-center gap-3 px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-label={t.label}
            aria-pressed={tab === t.id}
            className={`btn-chunky flex min-h-16 flex-1 flex-col items-center rounded-bubble px-3 py-2 text-3xl shadow-md border-b-4 ${
              tab === t.id
                ? "bg-white border-sunny-deep"
                : "bg-white/60 border-ink/10"
            }`}
            onClick={() => {
              playPop();
              speak(t.spoken);
              setTab(t.id);
            }}
          >
            <span aria-hidden="true">{t.emoji}</span>
            <span className="text-xs font-bold text-ink-soft">{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-md px-4">
        <AnimatePresence mode="wait">
          {tab === "house" && (
            <motion.section
              key="house"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              {/* The treehouse scene */}
              <div className="relative mb-5 flex h-64 items-end justify-center overflow-hidden rounded-bubble bg-gradient-to-b from-sky/60 to-leaf/40 shadow-inner">
                <span className="absolute bottom-0 text-[10rem] leading-none" aria-hidden="true">
                  🌳
                </span>
                {/* placed decorations float around the tree */}
                {placed.map((id, i) => {
                  const dec = DECORATIONS.find((d) => d.id === id);
                  if (!dec) return null;
                  const angle = (i / Math.max(placed.length, 1)) * Math.PI * 2;
                  return (
                    <motion.span
                      key={id}
                      className="absolute text-4xl"
                      aria-label={dec.name}
                      style={{
                        left: `${50 + Math.cos(angle) * 32}%`,
                        top: `${45 + Math.sin(angle) * 30}%`,
                      }}
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 2.5 + i * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {dec.emoji}
                    </motion.span>
                  );
                })}
                {/* the active pet lives here */}
                {activePet && (
                  <motion.span
                    className="absolute bottom-3 text-5xl"
                    aria-label="Your chosen pet"
                    animate={{ x: [-40, 40, -40] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {PETS.find((p) => p.id === activePet)?.emoji}
                  </motion.span>
                )}
              </div>

              <h2 className="mb-3 text-center text-xl font-extrabold text-ink">
                Spend your stars!
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {DECORATIONS.map((dec) => {
                  const isOwned = owned.includes(dec.id);
                  const isPlaced = placed.includes(dec.id);
                  const canAfford = available >= dec.cost;
                  return (
                    <button
                      key={dec.id}
                      type="button"
                      aria-label={
                        isOwned
                          ? `${dec.name}, ${isPlaced ? "shown" : "hidden"} — tap to toggle`
                          : `${dec.name}, costs ${dec.cost} stars`
                      }
                      className={`btn-chunky flex min-h-24 flex-col items-center justify-center gap-1 rounded-bubble p-2 shadow-md border-b-4 ${
                        isOwned
                          ? isPlaced
                            ? "bg-leaf/30 border-leaf-deep"
                            : "bg-white border-ink/15"
                          : canAfford
                            ? "bg-white border-sunny-deep"
                            : "bg-white/50 border-ink/10"
                      }`}
                      onClick={() => {
                        if (isOwned) {
                          playPop();
                          togglePlaced(dec.id);
                          speak(isPlaced ? `${dec.name} put away.` : `${dec.name} added!`);
                          return;
                        }
                        if (buyDecoration(dec.id, dec.cost)) {
                          playUnlock();
                          speak(`You unlocked the ${dec.name}! It looks wonderful!`);
                        } else {
                          playEncourage();
                          speak(
                            `You need ${dec.cost - available} more stars for the ${dec.name}. Keep tracing, you're doing great!`
                          );
                        }
                      }}
                    >
                      <span
                        className={`text-4xl ${isOwned ? "" : canAfford ? "" : "opacity-40 grayscale"}`}
                        aria-hidden="true"
                      >
                        {dec.emoji}
                      </span>
                      <span className="text-xs font-bold text-ink-soft">
                        {isOwned ? (isPlaced ? "✅" : "👁️") : `⭐${dec.cost}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.section>
          )}

          {tab === "pets" && (
            <motion.section
              key="pets"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <h2 className="mb-3 text-center text-xl font-extrabold text-ink">
                {myPets.length} of {PETS.length} friends found!
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {PETS.map((pet) => {
                  const found = myPets.some((p) => p.id === pet.id);
                  const isActive = activePet === pet.id;
                  return (
                    <button
                      key={pet.id}
                      type="button"
                      aria-label={found ? pet.name : "A friend not found yet"}
                      className={`btn-chunky flex min-h-28 flex-col items-center justify-center gap-1 rounded-bubble p-2 shadow-md border-b-4 ${
                        isActive
                          ? "bg-violet/25 border-violet-deep"
                          : found
                            ? "bg-white border-teal-deep"
                            : "bg-white/50 border-ink/10"
                      }`}
                      onClick={() => {
                        playPop();
                        if (!found) {
                          speak(
                            "This friend is still hiding! Trace more letters to find them!"
                          );
                          return;
                        }
                        setActivePet(isActive ? null : pet.id);
                        speak(
                          isActive
                            ? `${pet.name} is having a nap.`
                            : `${pet.spoken} ${pet.name} now lives in your treehouse!`
                        );
                      }}
                    >
                      <span className="text-4xl" aria-hidden="true">
                        {found ? pet.emoji : "❓"}
                      </span>
                      <span className="text-center text-[0.65rem] font-bold leading-tight text-ink-soft">
                        {found ? pet.name : "???"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.section>
          )}

          {tab === "stickers" && (
            <motion.section
              key="stickers"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <h2 className="mb-3 text-center text-xl font-extrabold text-ink">
                {stickers.length} stickers collected!
              </h2>
              {stickers.length === 0 ? (
                <p className="rounded-bubble bg-white/70 p-6 text-center text-lg font-semibold text-ink-soft">
                  Trace anything to earn your first sticker! ✨
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {stickers.map((g, i) => (
                    <motion.div
                      key={g.id}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.6), type: "spring" }}
                      className="flex aspect-square items-center justify-center rounded-2xl bg-white shadow-md"
                      aria-label={`Sticker: ${g.spoken}`}
                    >
                      {g.display ? (
                        <span className="text-3xl font-extrabold text-violet-deep">
                          {g.display}
                        </span>
                      ) : (
                        <GlyphPreview
                          glyph={g}
                          color="#7c3aed"
                          strokeWidth={11}
                          className="h-9 w-9"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed bottom-3 right-3">
        <Mascot
          mood="happy"
          says="This is your treehouse! Tap things to decorate it!"
          size={80}
        />
      </div>
    </div>
  );
}
