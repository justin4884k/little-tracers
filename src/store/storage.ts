"use client";

import { get, set, del } from "idb-keyval";
import { createJSONStorage, type StateStorage } from "zustand/middleware";

/** Zustand persistence backed by IndexedDB (async, offline, local-only). */
const indexedDbStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: async (name, value) => {
    await set(name, value);
  },
  removeItem: async (name) => {
    await del(name);
  },
};

export const idbJsonStorage = () => createJSONStorage(() => indexedDbStorage);
