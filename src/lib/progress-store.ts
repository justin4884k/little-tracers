"use client";

import { openDB, type DBSchema } from "idb";
import type { ProgressState, RewardKind, SettingsState } from "@/types/learning";

const DB_NAME = "little-tracers";
const DB_VERSION = 1;

type StoredValue<T> = {
  key: string;
  value: T;
};

interface LittleTracersDb extends DBSchema {
  progress: {
    key: string;
    value: StoredValue<ProgressState>;
  };
  settings: {
    key: string;
    value: StoredValue<SettingsState>;
  };
}

export const defaultSettings: SettingsState = {
  musicVolume: 45,
  effectsVolume: 70,
  narration: true,
  preferHumanVoice: true,
  difficulty: "sprout",
  tracingAssist: 72,
  language: "English",
  leftHanded: false,
  highContrast: false,
  largeText: false,
  colorblind: false,
};

export const defaultProgress: ProgressState = {
  practiceSeconds: 0,
  streak: 1,
  stars: 0,
  stickers: [],
  pets: [],
  puzzlePieces: 0,
  decorations: [],
  lessons: {},
  favorites: {},
};

const dbPromise = () =>
  openDB<LittleTracersDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore("progress", { keyPath: "key" });
      db.createObjectStore("settings", { keyPath: "key" });
    },
  });

export async function loadProgress(): Promise<ProgressState> {
  const db = await dbPromise();
  return (await db.get("progress", "family"))?.value ?? defaultProgress;
}

export async function saveProgress(progress: ProgressState) {
  const db = await dbPromise();
  await db.put("progress", { key: "family", value: progress });
}

export async function loadSettings(): Promise<SettingsState> {
  const db = await dbPromise();
  return { ...defaultSettings, ...((await db.get("settings", "device"))?.value ?? {}) };
}

export async function saveSettings(settings: SettingsState) {
  const db = await dbPromise();
  await db.put("settings", { key: "device", value: settings });
}

export function applyLessonCompletion(
  progress: ProgressState,
  lessonId: string,
  accuracy: number,
  reward: RewardKind,
): ProgressState {
  const rewardLabel = reward === "pet" ? "Pip" : reward === "sticker" ? "Shiny Leaf" : reward === "decoration" ? "Glow Tile" : "Spark";
  const prior = progress.lessons[lessonId];

  return {
    ...progress,
    practiceSeconds: progress.practiceSeconds + 90,
    stars: progress.stars + 3,
    puzzlePieces: reward === "puzzle" ? progress.puzzlePieces + 1 : progress.puzzlePieces,
    stickers: reward === "sticker" && !progress.stickers.includes(rewardLabel) ? [...progress.stickers, rewardLabel] : progress.stickers,
    pets: reward === "pet" && !progress.pets.includes(rewardLabel) ? [...progress.pets, rewardLabel] : progress.pets,
    decorations:
      reward === "decoration" && !progress.decorations.includes(rewardLabel)
        ? [...progress.decorations, rewardLabel]
        : progress.decorations,
    favorites: {
      ...progress.favorites,
      [lessonId]: (progress.favorites[lessonId] ?? 0) + 1,
    },
    lessons: {
      ...progress.lessons,
      [lessonId]: {
        lessonId,
        completions: (prior?.completions ?? 0) + 1,
        bestAccuracy: Math.max(prior?.bestAccuracy ?? 0, accuracy),
        lastCompletedAt: new Date().toISOString(),
      },
    },
  };
}

export function summarizeProgress(progress: ProgressState) {
  const completed = Object.values(progress.lessons);
  const mastered = completed.filter((lesson) => lesson.bestAccuracy >= 84);
  const averageAccuracy =
    completed.length === 0
      ? 0
      : Math.round(completed.reduce((total, lesson) => total + lesson.bestAccuracy, 0) / completed.length);

  return {
    completedCount: completed.length,
    masteredCount: mastered.length,
    averageAccuracy,
    practiceMinutes: Math.round(progress.practiceSeconds / 60),
    favoriteActivities: Object.entries(progress.favorites)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lessonId]) => lessonId),
  };
}
