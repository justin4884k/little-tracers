"use client";

import { useSyncExternalStore } from "react";

/** Chosen once per page load, on the client only. */
const CLIENT_SEED = Math.floor(Math.random() * 1_000_000) + 1;

const subscribe = () => () => {};
const getClientSnapshot = () => CLIENT_SEED;
const getServerSnapshot = () => 0;

/**
 * A stable random seed that is `0` during server rendering and a real random
 * value on the client. `useSyncExternalStore` is the supported way to read a
 * client-only value without a hydration mismatch and without a setState-in-
 * effect cascade — components stay pure and derive everything from the seed.
 */
export function useClientSeed(): number {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

/** Deterministic pseudo-random in [0,1) from a seed and an index. */
export function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297) * 233280;
  return x - Math.floor(x);
}
