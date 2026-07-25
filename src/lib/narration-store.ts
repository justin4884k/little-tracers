"use client";

import { openDB, type DBSchema } from "idb";
import type { NarrationClip } from "@/types/learning";

const DB_NAME = "little-tracers-human-voice";
const DB_VERSION = 1;

interface NarrationDb extends DBSchema {
  clips: {
    key: string;
    value: NarrationClip;
  };
}

const dbPromise = () =>
  openDB<NarrationDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore("clips", { keyPath: "lessonId" });
    },
  });

export async function loadNarrationClip(lessonId: string) {
  const db = await dbPromise();
  return db.get("clips", lessonId);
}

export async function saveNarrationClip(clip: NarrationClip) {
  const db = await dbPromise();
  await db.put("clips", clip);
}

export async function deleteNarrationClip(lessonId: string) {
  const db = await dbPromise();
  await db.delete("clips", lessonId);
}

export async function listNarrationClips() {
  const db = await dbPromise();
  return db.getAll("clips");
}
