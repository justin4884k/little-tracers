"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useClientSeed, seededRandom } from "@/lib/useClientSeed";

interface Puzzle {
  a: number;
  b: number;
  answer: number;
  options: number[];
}

/** Pure: the same seed and round always produce the same puzzle. */
function makePuzzle(seed: number, round: number): Puzzle {
  const k = seed + round * 7919;
  const a = 3 + Math.floor(seededRandom(k, 1) * 6);
  const b = 4 + Math.floor(seededRandom(k, 2) * 6);
  const answer = a * b;

  const set = new Set<number>([answer]);
  let i = 3;
  while (set.size < 4) {
    const candidate = answer + Math.floor(seededRandom(k, i) * 13) - 6;
    if (candidate > 0) set.add(candidate);
    i += 1;
  }
  const options = [...set];
  // Deterministic shuffle so the answer isn't always in the same slot.
  for (let j = options.length - 1; j > 0; j--) {
    const swap = Math.floor(seededRandom(k, 50 + j) * (j + 1));
    [options[j], options[swap]] = [options[swap], options[j]];
  }
  return { a, b, answer, options };
}

/**
 * A light "grown-ups only" gate. Not security — just a small arithmetic step
 * a 3–6 year old won't complete by accident, keeping the child in the play
 * area and out of settings.
 *
 * The puzzle is derived from a client-only seed, so it is random per visit
 * without causing a hydration mismatch.
 */
export function AdultGate({ children }: { children: ReactNode }) {
  const seed = useClientSeed();
  const [round, setRound] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [wrong, setWrong] = useState(false);

  const puzzle = useMemo(
    () => (seed === 0 ? null : makePuzzle(seed, round)),
    [seed, round]
  );

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-gradient-to-b from-[#e0e7ff] to-[#f3e8ff] p-6">
      <div className="w-full max-w-sm rounded-bubble bg-white p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-2xl font-extrabold text-ink">
          Grown-ups only
        </h1>

        {puzzle ? (
          <>
            <p className="mb-6 text-center text-base text-ink-soft">
              What is{" "}
              <span className="font-extrabold text-violet-deep">
                {puzzle.a} × {puzzle.b}
              </span>
              ?
            </p>

            <div className="grid grid-cols-2 gap-3">
              {puzzle.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="btn-chunky min-h-16 rounded-bubble bg-violet/10 text-2xl font-extrabold text-violet-deep border-b-4 border-violet/40"
                  onClick={() => {
                    if (opt === puzzle.answer) {
                      setUnlocked(true);
                    } else {
                      setWrong(true);
                      setRound((r) => r + 1);
                    }
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {wrong && (
              <p className="mt-4 text-center text-sm font-semibold text-coral-deep">
                Not quite — here&apos;s another one.
              </p>
            )}
          </>
        ) : (
          <p className="mb-6 text-center text-base text-ink-soft">Loading…</p>
        )}

        <Link
          href="/"
          className="mt-6 block text-center text-base font-semibold text-ink-soft underline"
        >
          Back to the app
        </Link>
      </div>
    </div>
  );
}
