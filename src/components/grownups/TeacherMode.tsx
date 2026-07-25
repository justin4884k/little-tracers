"use client";

import { useState } from "react";
import Link from "next/link";
import { WORLDS } from "@/data/worlds";
import { useSettingsStore } from "@/store/settingsStore";
import { useProgressStore } from "@/store/progressStore";
import { VoicePicker } from "./VoicePicker";

/** Lesson assignment, worksheets, classroom settings, and reset. */
export function TeacherMode() {
  const mission = useSettingsStore((s) => s.mission);
  const setMission = useSettingsStore((s) => s.setMission);
  const voiceOn = useSettingsStore((s) => s.voiceOn);
  const soundOn = useSettingsStore((s) => s.soundOn);
  const setVoiceOn = useSettingsStore((s) => s.setVoiceOn);
  const setSoundOn = useSettingsStore((s) => s.setSoundOn);
  const resetAll = useProgressStore((s) => s.resetAll);

  const [confirmReset, setConfirmReset] = useState(false);
  const [openWorld, setOpenWorld] = useState<string>(WORLDS[1].id);

  const toggle = (glyphId: string) => {
    setMission(
      mission.includes(glyphId)
        ? mission.filter((id) => id !== glyphId)
        : [...mission, glyphId]
    );
  };

  const worksheetHref =
    mission.length > 0
      ? `/print/worksheet?glyphs=${encodeURIComponent(mission.join(","))}`
      : "/print/worksheet";

  return (
    <div className="flex flex-col gap-6">
      {/* Assignment */}
      <section className="rounded-bubble bg-white p-5 shadow-md">
        <h2 className="mb-1 text-lg font-extrabold text-ink">Assign a mission</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Selected lessons appear as a “Today&apos;s mission” button on the child&apos;s
          map. {mission.length} selected.
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {WORLDS.map((w) => (
            <button
              key={w.id}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                openWorld === w.id
                  ? "bg-violet text-white"
                  : "bg-violet/10 text-violet-deep"
              }`}
              onClick={() => setOpenWorld(w.id)}
            >
              {w.emoji} {w.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {WORLDS.find((w) => w.id === openWorld)?.glyphs.map((g) => {
            const on = mission.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                className={`min-h-11 min-w-11 rounded-xl px-3 py-2 text-sm font-bold ${
                  on
                    ? "bg-leaf text-white"
                    : "bg-ink/5 text-ink hover:bg-ink/10"
                }`}
                onClick={() => toggle(g.id)}
              >
                {g.display || g.spoken.replace(/^an? /, "")}
              </button>
            );
          })}
        </div>

        {mission.length > 0 && (
          <button
            type="button"
            className="mt-4 rounded-full bg-ink/10 px-4 py-2 text-sm font-bold text-ink"
            onClick={() => setMission([])}
          >
            Clear mission
          </button>
        )}
      </section>

      {/* Worksheets */}
      <section className="rounded-bubble bg-white p-5 shadow-md">
        <h2 className="mb-1 text-lg font-extrabold text-ink">Printable worksheets</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Generate dotted-line tracing sheets for off-screen practice. Prints the
          assigned mission, or a full alphabet sheet if nothing is assigned.
        </p>
        <Link
          href={worksheetHref}
          className="inline-block rounded-bubble bg-teal px-6 py-3 font-bold text-white shadow-md"
        >
          🖨️ Open worksheets
        </Link>
      </section>

      <VoicePicker />

      {/* Classroom mode */}
      <section className="rounded-bubble bg-white p-5 shadow-md">
        <h2 className="mb-4 text-lg font-extrabold text-ink">Classroom settings</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between gap-4">
            <span className="text-base font-semibold text-ink">
              Voice narration
              <span className="block text-xs font-normal text-ink-soft">
                Turn off for shared classrooms or quiet time
              </span>
            </span>
            <input
              type="checkbox"
              className="h-7 w-7 accent-violet"
              checked={voiceOn}
              onChange={(e) => setVoiceOn(e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-base font-semibold text-ink">
              Sound effects
              <span className="block text-xs font-normal text-ink-soft">
                Chimes, sparkles and celebration sounds
              </span>
            </span>
            <input
              type="checkbox"
              className="h-7 w-7 accent-violet"
              checked={soundOn}
              onChange={(e) => setSoundOn(e.target.checked)}
            />
          </label>
        </div>
      </section>

      {/* Reset */}
      <section className="rounded-bubble border-2 border-coral/30 bg-white p-5 shadow-md">
        <h2 className="mb-1 text-lg font-extrabold text-ink">Reset progress</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Clears all stars, pets, stickers and practice history on this device.
          This cannot be undone.
        </p>
        {confirmReset ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-bubble bg-coral-deep px-6 py-3 font-bold text-white shadow-md"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
              }}
            >
              Yes, erase everything
            </button>
            <button
              type="button"
              className="rounded-bubble bg-ink/10 px-6 py-3 font-bold text-ink"
              onClick={() => setConfirmReset(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="rounded-bubble bg-coral/15 px-6 py-3 font-bold text-coral-deep"
            onClick={() => setConfirmReset(true)}
          >
            Reset all progress
          </button>
        )}
      </section>
    </div>
  );
}
