import { PETS, type Pet } from "@/data/rewards";
import { WORLDS } from "@/data/worlds";
import type { LessonProgress } from "@/store/progressStore";

/**
 * Pure reward rules: entitlements are always derived from progress, so the
 * UI can never drift from the truth (and progress resets stay consistent).
 */

export function completedCountForWorld(
  worldId: string,
  progress: Record<string, LessonProgress>
): number {
  const world = WORLDS.find((w) => w.id === worldId);
  if (!world) return 0;
  return world.glyphs.filter((g) => (progress[g.id]?.stars ?? 0) > 0).length;
}

/** All pets earned by the current progress. */
export function earnedPets(progress: Record<string, LessonProgress>): Pet[] {
  return PETS.filter((pet) => {
    const world = WORLDS.find((w) => w.id === pet.world);
    if (!world) return false;
    const done = completedCountForWorld(pet.world, progress);
    return done / world.glyphs.length >= pet.milestone - 1e-9;
  });
}

/** Pets newly earned by `after` that were not earned by `before`. */
export function newlyEarnedPets(
  before: Record<string, LessonProgress>,
  after: Record<string, LessonProgress>
): Pet[] {
  const beforeIds = new Set(earnedPets(before).map((p) => p.id));
  return earnedPets(after).filter((p) => !beforeIds.has(p.id));
}

export function totalStars(progress: Record<string, LessonProgress>): number {
  return Object.values(progress).reduce((sum, p) => sum + p.stars, 0);
}
