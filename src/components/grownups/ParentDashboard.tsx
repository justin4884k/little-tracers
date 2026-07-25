"use client";

import { useMemo } from "react";
import { WORLDS, ALL_GLYPHS } from "@/data/worlds";
import { completedCountForWorld, earnedPets } from "@/engine/rewards";
import {
  useProgressStore,
  starsEarned,
  practiceStreak,
  lastNDays,
} from "@/store/progressStore";

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "under a minute";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  return `${h}h ${minutes % 60}m`;
}

function StatCard({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-bubble bg-white p-4 text-center shadow-md">
      <div className="text-3xl" aria-hidden="true">
        {emoji}
      </div>
      <div className="text-2xl font-extrabold text-ink">{value}</div>
      <div className="text-xs font-semibold text-ink-soft">{label}</div>
    </div>
  );
}

/** Read-only insight for parents. All data is local to this device. */
export function ParentDashboard() {
  const progress = useProgressStore((s) => s.progress);
  const dailyLog = useProgressStore((s) => s.dailyLog);

  const stars = starsEarned(progress);
  const streak = practiceStreak(dailyLog);
  const week = useMemo(() => lastNDays(dailyLog, 7), [dailyLog]);
  const maxMs = Math.max(...week.map((d) => d.ms), 1);

  const totalMs = Object.values(progress).reduce((n, p) => n + p.practiceMs, 0);
  const mastered = Object.values(progress).filter((p) => p.stars === 3).length;
  const started = Object.values(progress).length;
  const pets = earnedPets(progress).length;

  const favorites = useMemo(
    () =>
      Object.values(progress)
        .slice()
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 5)
        .map((p) => ({
          entry: p,
          glyph: ALL_GLYPHS.find((g) => g.id === p.glyphId),
        }))
        .filter((f) => f.glyph),
    [progress]
  );

  const needsPractice = useMemo(
    () =>
      Object.values(progress)
        .filter((p) => p.stars === 1)
        .slice()
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 5)
        .map((p) => ALL_GLYPHS.find((g) => g.id === p.glyphId))
        .filter((g): g is NonNullable<typeof g> => Boolean(g)),
    [progress]
  );

  if (started === 0) {
    return (
      <div className="rounded-bubble bg-white p-8 text-center shadow-md">
        <p className="text-lg font-semibold text-ink">No practice yet.</p>
        <p className="mt-2 text-base text-ink-soft">
          Once your child traces their first letter, their progress will appear
          here — stored only on this device.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard emoji="⭐" value={stars} label="stars earned" />
        <StatCard emoji="🔥" value={`${streak} day${streak === 1 ? "" : "s"}`} label="practice streak" />
        <StatCard emoji="✍️" value={mastered} label="mastered (3★)" />
        <StatCard emoji="⏱️" value={formatDuration(totalMs)} label="total practice" />
      </section>

      {/* 7-day practice chart */}
      <section className="rounded-bubble bg-white p-5 shadow-md">
        <h2 className="mb-4 text-lg font-extrabold text-ink">This week</h2>
        <div className="flex h-32 items-end justify-between gap-2">
          {week.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-violet to-blossom transition-all"
                style={{ height: `${Math.max((d.ms / maxMs) * 100, 3)}%` }}
                title={`${d.label}: ${formatDuration(d.ms)}`}
              />
              <span className="text-xs font-semibold text-ink-soft">{d.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-ink-soft">
          Minutes of tracing practice per day
        </p>
      </section>

      {/* Per-world progress */}
      <section className="rounded-bubble bg-white p-5 shadow-md">
        <h2 className="mb-4 text-lg font-extrabold text-ink">Worlds</h2>
        <div className="flex flex-col gap-3">
          {WORLDS.map((w) => {
            const done = completedCountForWorld(w.id, progress);
            const pct = Math.round((done / w.glyphs.length) * 100);
            return (
              <div key={w.id}>
                <div className="mb-1 flex justify-between text-sm font-semibold text-ink">
                  <span>
                    {w.emoji} {w.name}
                  </span>
                  <span className="text-ink-soft">
                    {done}/{w.glyphs.length}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: w.theme.accentDeep }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-bubble bg-white p-5 shadow-md">
          <h2 className="mb-3 text-lg font-extrabold text-ink">Favourite activities</h2>
          <ul className="flex flex-col gap-2">
            {favorites.map(({ entry, glyph }) => (
              <li key={entry.glyphId} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">{glyph!.spoken}</span>
                <span className="text-ink-soft">
                  {entry.attempts} {entry.attempts === 1 ? "try" : "tries"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-bubble bg-white p-5 shadow-md">
          <h2 className="mb-3 text-lg font-extrabold text-ink">Could use more practice</h2>
          {needsPractice.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Nothing here — everything tried has gone well!
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {needsPractice.map((g) => (
                <li key={g.id} className="text-sm font-semibold text-ink">
                  {g.spoken}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-ink-soft">
            The app automatically widens the tracing path for these, so practice
            stays encouraging rather than frustrating.
          </p>
        </section>
      </div>

      <p className="text-center text-sm text-ink-soft">
        🐾 {pets} animal friends collected · all data stays on this device, and
        is never uploaded anywhere.
      </p>
    </div>
  );
}
