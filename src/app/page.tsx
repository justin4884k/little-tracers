"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mascot } from "@/components/mascot/Mascot";
import { BigButton } from "@/components/ui/BigButton";
import { warmUpAudio, playFanfare } from "@/lib/sounds";
import { warmUpSpeech, speak } from "@/lib/speech";

const CLOUDS: Array<{
  top: string;
  left?: string;
  right?: string;
  size: number;
  delay: number;
}> = [
  { top: "8%", left: "6%", size: 90, delay: 0 },
  { top: "16%", right: "8%", size: 70, delay: 1.2 },
  { top: "62%", left: "4%", size: 60, delay: 0.6 },
  { top: "70%", right: "10%", size: 84, delay: 1.8 },
];

/** Landing screen — one giant tap starts the adventure (and unlocks audio). */
export default function LandingPage() {
  const router = useRouter();

  const startAdventure = () => {
    warmUpAudio();
    warmUpSpeech();
    playFanfare();
    speak("Hi friend! I'm Pip! Let's go on a tracing adventure!");
    setTimeout(() => router.push("/map"), 900);
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky via-[#bae6fd] to-[#fde68a] p-6">
      {/* floating clouds */}
      {CLOUDS.map((c, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="absolute select-none opacity-80"
          style={{ top: c.top, left: c.left, right: c.right, fontSize: c.size }}
          animate={{ x: [0, 14, 0] }}
          transition={{ duration: 7, repeat: Infinity, delay: c.delay, ease: "easeInOut" }}
        >
          ☁️
        </motion.div>
      ))}

      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="z-10 flex flex-col items-center gap-2 text-center"
      >
        <h1 className="text-6xl font-extrabold tracking-tight text-ink drop-shadow-sm sm:text-7xl">
          Little{" "}
          <span className="bg-gradient-to-r from-coral via-violet to-teal bg-clip-text text-transparent">
            Tracers
          </span>
        </h1>
        <p className="text-xl font-semibold text-ink-soft">A handwriting adventure!</p>
      </motion.div>

      <div className="z-10 my-8">
        <Mascot mood="excited" says="Hi! I'm Pip! Tap the big button to play!" size={170} />
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 14 }}
        className="z-10"
      >
        <BigButton
          onClick={startAdventure}
          color="#4ade80"
          colorDeep="#22c55e"
          className="!px-14 !py-6 !text-4xl"
          ariaLabel="Start playing"
        >
          ▶️ Play!
        </BigButton>
      </motion.div>

      <Link
        href="/grown-ups"
        className="z-10 mt-10 rounded-full bg-white/70 px-5 py-3 text-base font-semibold text-ink-soft shadow-sm"
      >
        👨‍👩‍👧 Grown-ups
      </Link>
    </div>
  );
}
