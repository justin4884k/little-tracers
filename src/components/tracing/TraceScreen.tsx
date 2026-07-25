"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Glyph, TraceResult } from "@/engine/types";
import { useTraceEngine } from "@/engine/useTraceEngine";
import { newlyEarnedPets } from "@/engine/rewards";
import type { World } from "@/data/worlds";
import { getNextGlyph } from "@/data/worlds";
import type { Pet } from "@/data/rewards";
import { DEFAULT_TOLERANCE, useProgressStore } from "@/store/progressStore";
import { speak, stopSpeaking } from "@/lib/speech";
import {
  playFanfare,
  playSparkle,
  playStrokeDone,
  playEncourage,
  playUnlock,
} from "@/lib/sounds";
import { BackButton } from "@/components/ui/BackButton";
import { Mascot } from "@/components/mascot/Mascot";
import type { MascotMood } from "@/components/mascot/Mascot";
import { BigButton } from "@/components/ui/BigButton";
import { CelebrationOverlay } from "./CelebrationOverlay";

const TraceStage = dynamic(() => import("./TraceStage"), { ssr: false });

interface TraceScreenProps {
  glyph: Glyph;
  world: World;
}

export function TraceScreen({ glyph, world }: TraceScreenProps) {
  const router = useRouter();
  const recordResult = useProgressStore((s) => s.recordResult);
  const markPetCelebrated = useProgressStore((s) => s.markPetCelebrated);
  const tolerance = useProgressStore(
    (s) => s.progress[glyph.id]?.tolerance ?? DEFAULT_TOLERANCE
  );

  const [result, setResult] = useState<TraceResult | null>(null);
  const [newPet, setNewPet] = useState<Pet | null>(null);
  const [mascotMood, setMascotMood] = useState<MascotMood>("happy");

  const nextGlyph = getNextGlyph(glyph.id);

  const handleComplete = useCallback(
    (r: TraceResult) => {
      playFanfare();
      const before = useProgressStore.getState().progress;
      recordResult(r);
      const after = useProgressStore.getState().progress;
      const fresh = newlyEarnedPets(before, after).filter(
        (p) => !useProgressStore.getState().celebratedPets.includes(p.id)
      );
      const pet = fresh[0] ?? null;
      if (pet) {
        markPetCelebrated(pet.id);
        setTimeout(playUnlock, 900);
      }
      setNewPet(pet);
      setResult(r);
      const cheer =
        r.stars === 3
          ? "Wow! Absolutely amazing!"
          : r.stars === 2
            ? "Fantastic tracing!"
            : "You did it! Great trying!";
      speak(`${cheer} ${glyph.phrase}${pet ? ` ${pet.spoken}` : ""}`);
    },
    [glyph.phrase, recordResult, markPetCelebrated]
  );

  const engine = useTraceEngine(glyph, tolerance, {
    onProgress: (_s, i) => {
      if (i % 6 === 0) playSparkle(i / 6);
    },
    onStrokeComplete: (i) => {
      playStrokeDone();
      if (i + 1 < glyph.strokes.length) {
        speak(i === 0 ? "Great! Now the next part!" : "Beautiful! Keep going!", {
          interrupt: false,
        });
      }
    },
    onGlyphComplete: handleComplete,
    onHint: () => {
      playEncourage();
      setMascotMood("encouraging");
      speak("You can do it! Start at the glowing dot and follow the sparkly path!");
      setTimeout(() => setMascotMood("happy"), 4000);
    },
  });

  /* Narration on arrival + when the child's turn starts. */
  const introduced = useRef(false);
  useEffect(() => {
    introduced.current = false;
  }, [glyph.id]);

  useEffect(() => {
    if (engine.phase === "demo" && !introduced.current) {
      introduced.current = true;
      speak(`Let's trace ${glyph.spoken}! Watch how Pip does it!`);
    }
    if (engine.phase === "ready" && engine.strokeIndex === 0 && engine.progressIndex === 0) {
      speak("Now it's your turn! Put your finger on the glowing dot!", {
        interrupt: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.phase, glyph.id]);

  useEffect(() => () => stopSpeaking(), []);

  /* Responsive square canvas */
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(320);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize(Math.floor(Math.min(rect.width, rect.height)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const restart = () => {
    setResult(null);
    setNewPet(null);
    engine.reset();
  };

  const goNext = () => {
    stopSpeaking();
    if (nextGlyph) router.push(`/trace/${nextGlyph.id}`);
    else router.push(`/world/${world.id}`);
  };

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{
        background: `linear-gradient(160deg, ${world.theme.from}, ${world.theme.via}, ${world.theme.to})`,
      }}
    >
      {/* Header */}
      <header className="no-print flex items-center justify-between p-4">
        <BackButton href={`/world/${world.id}`} />
        <div className="rounded-bubble bg-white/80 px-6 py-2 shadow-md">
          <h1 className="text-2xl font-extrabold text-ink">
            {glyph.display ? glyph.display : glyph.spoken}
          </h1>
        </div>
        <BigButton
          color={world.theme.accent}
          colorDeep={world.theme.accentDeep}
          ariaLabel="Watch Pip show me again"
          speakText="Watch Pip show you how!"
          onClick={() => engine.beginDemo()}
          className="!min-h-16 !px-5"
        >
          👀
        </BigButton>
      </header>

      {/* Canvas */}
      <main className="flex flex-1 items-center justify-center px-4 pb-2">
        <div
          ref={boxRef}
          className="relative aspect-square w-full max-w-[min(88vw,60vh)] rounded-bubble bg-white/90 shadow-2xl"
          style={{ touchAction: "none" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <TraceStage
              glyph={glyph}
              samples={engine.samples}
              phase={engine.phase}
              strokeIndex={engine.strokeIndex}
              progressIndex={engine.progressIndex}
              trail={engine.trail}
              size={size}
              inkColors={world.theme.ink}
              accent={world.theme.accentDeep}
              onDemoComplete={engine.finishDemo}
              onPointerDown={engine.pointerDown}
              onPointerMove={engine.pointerMove}
              onPointerUp={engine.pointerUp}
            />
          </div>
        </div>
      </main>

      {/* Pip cheers from the corner */}
      <div className="pointer-events-auto flex items-end justify-start px-6 pb-4">
        <Mascot
          mood={engine.phase === "celebrating" ? "cheering" : mascotMood}
          says={
            engine.phase === "demo"
              ? `Watch closely! This is ${glyph.spoken}!`
              : "Follow the sparkly path! You can do it!"
          }
          size={92}
        />
      </div>

      <AnimatePresence>
        {result && (
          <CelebrationOverlay
            stars={result.stars}
            phrase={glyph.phrase}
            newPet={newPet}
            hasNext={Boolean(nextGlyph)}
            onAgain={restart}
            onNext={goNext}
            onPetSeen={() => newPet && speak(newPet.spoken)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
