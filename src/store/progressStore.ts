"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TraceResult } from "@/engine/types";
import { idbJsonStorage } from "./storage";

export const DEFAULT_TOLERANCE = 9;
const MIN_TOLERANCE = 7;
const MAX_TOLERANCE = 14;

export interface LessonProgress {
  glyphId: string;
  /** Best stars earned, 0 = not yet completed. */
  stars: number;
  attempts: number;
  /** Adaptive tracing tolerance for this glyph, in glyph units. */
  tolerance: number;
  practiceMs: number;
  completedAt: number | null;
}

interface ProgressState {
  progress: Record<string, LessonProgress>;
  starsSpent: number;
  ownedDecorations: string[];
  placedDecorations: string[];
  activePet: string | null;
  /** Pets whose hatch celebration has been shown. */
  celebratedPets: string[];
  /** Practice ms per day, keyed YYYY-MM-DD (for streaks & parent charts). */
  dailyLog: Record<string, number>;

  recordResult: (result: TraceResult) => void;
  buyDecoration: (id: string, cost: number) => boolean;
  togglePlaced: (id: string) => void;
  setActivePet: (id: string | null) => void;
  markPetCelebrated: (id: string) => void;
  resetAll: () => void;
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      starsSpent: 0,
      ownedDecorations: [],
      placedDecorations: [],
      activePet: null,
      celebratedPets: [],
      dailyLog: {},

      recordResult: (result) => {
        const prev = get().progress[result.glyphId];
        const tolerance = prev?.tolerance ?? DEFAULT_TOLERANCE;
        // Adaptive difficulty: struggling widens the path noticeably,
        // mastery narrows it very gently. Never mid-lesson, never punishing.
        const nextTolerance =
          result.stars === 1
            ? Math.min(MAX_TOLERANCE, tolerance + 1.5)
            : result.stars === 3
              ? Math.max(MIN_TOLERANCE, tolerance - 0.5)
              : tolerance;

        const entry: LessonProgress = {
          glyphId: result.glyphId,
          stars: Math.max(prev?.stars ?? 0, result.stars),
          attempts: (prev?.attempts ?? 0) + 1,
          tolerance: nextTolerance,
          practiceMs: (prev?.practiceMs ?? 0) + result.durationMs,
          completedAt: Date.now(),
        };

        const key = todayKey();
        set((s) => ({
          progress: { ...s.progress, [result.glyphId]: entry },
          dailyLog: {
            ...s.dailyLog,
            [key]: (s.dailyLog[key] ?? 0) + result.durationMs,
          },
        }));
      },

      buyDecoration: (id, cost) => {
        const s = get();
        if (s.ownedDecorations.includes(id)) return false;
        const earned = Object.values(s.progress).reduce((n, p) => n + p.stars, 0);
        if (earned - s.starsSpent < cost) return false;
        set({
          starsSpent: s.starsSpent + cost,
          ownedDecorations: [...s.ownedDecorations, id],
          placedDecorations: [...s.placedDecorations, id],
        });
        return true;
      },

      togglePlaced: (id) =>
        set((s) => ({
          placedDecorations: s.placedDecorations.includes(id)
            ? s.placedDecorations.filter((d) => d !== id)
            : [...s.placedDecorations, id],
        })),

      setActivePet: (id) => set({ activePet: id }),

      markPetCelebrated: (id) =>
        set((s) => ({
          celebratedPets: s.celebratedPets.includes(id)
            ? s.celebratedPets
            : [...s.celebratedPets, id],
        })),

      resetAll: () =>
        set({
          progress: {},
          starsSpent: 0,
          ownedDecorations: [],
          placedDecorations: [],
          activePet: null,
          celebratedPets: [],
          dailyLog: {},
        }),
    }),
    {
      name: "little-tracers-progress",
      storage: idbJsonStorage(),
    }
  )
);

/* ---------- Derived helpers (pure, usable in selectors) ---------- */

export function starsEarned(progress: Record<string, LessonProgress>): number {
  return Object.values(progress).reduce((n, p) => n + p.stars, 0);
}

/** Consecutive practice days ending today (or yesterday, so streaks don't break mid-day). */
export function practiceStreak(dailyLog: Record<string, number>): number {
  let streak = 0;
  const day = new Date();
  // A streak may still be alive if the child hasn't practiced *yet* today.
  if (!dailyLog[todayKey(day)]) day.setDate(day.getDate() - 1);
  while (dailyLog[todayKey(day)]) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

export function lastNDays(
  dailyLog: Record<string, number>,
  n: number
): { date: string; label: string; ms: number }[] {
  const out: { date: string; label: string; ms: number }[] = [];
  const day = new Date();
  day.setDate(day.getDate() - (n - 1));
  for (let i = 0; i < n; i++) {
    const key = todayKey(day);
    out.push({
      date: key,
      label: day.toLocaleDateString(undefined, { weekday: "short" }),
      ms: dailyLog[key] ?? 0,
    });
    day.setDate(day.getDate() + 1);
  }
  return out;
}
