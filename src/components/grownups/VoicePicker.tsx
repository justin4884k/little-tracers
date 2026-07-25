"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { listVoices, speak, activeVoiceName } from "@/lib/speech";

const SAMPLE = "Great tracing! A is for apple. You are doing wonderfully!";

/** Is this a modern neural/premium voice rather than a legacy robotic one? */
function isNatural(name: string): boolean {
  return (
    /\b(neural|natural|siri|premium|enhanced|wavenet|studio|journey|chirp)\b/i.test(name) ||
    /^google\s/i.test(name)
  );
}

/**
 * Lets a grown-up choose the narration voice. Which voices exist varies
 * enormously by browser and OS, so the app auto-picks the best available and
 * this simply exposes the choice — plus a nudge when the device only has
 * old robotic voices installed.
 */
export function VoicePicker() {
  const voiceURI = useSettingsStore((s) => s.voiceURI);
  const setVoiceURI = useSettingsStore((s) => s.setVoiceURI);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      setVoices(listVoices());
      setActive(activeVoiceName());
    };
    load();
    // Chrome populates the voice list asynchronously.
    const timer = setTimeout(load, 600);
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => {
      clearTimeout(timer);
      window.speechSynthesis?.removeEventListener("voiceschanged", load);
      setTimeout(() => window.speechSynthesis?.cancel(), 0);
    };
  }, []);

  const anyNatural = voices.some((v) => isNatural(v.name));

  return (
    <section className="rounded-bubble bg-white p-5 shadow-md">
      <h2 className="mb-1 text-lg font-extrabold text-ink">Narration voice</h2>
      <p className="mb-4 text-sm text-ink-soft">
        Little Tracers automatically picks the most natural-sounding voice your
        device has. You can choose a different one here.
        {active && (
          <>
            {" "}
            Currently using <span className="font-bold text-ink">{active}</span>.
          </>
        )}
      </p>

      {voices.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No speech voices are available in this browser.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="min-h-12 flex-1 rounded-bubble border-2 border-violet/30 bg-white px-4 py-2 text-base font-semibold text-ink"
              value={voiceURI ?? ""}
              onChange={(e) => {
                const next = e.target.value || null;
                setVoiceURI(next);
                speak(SAMPLE, { force: true });
              }}
            >
              <option value="">Best available (recommended)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}
                  {isNatural(v.name) ? " ✨" : ""}
                  {v.localService ? "" : " (needs internet)"}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="min-h-12 rounded-bubble bg-violet px-6 py-3 font-bold text-white shadow-md"
              onClick={() => speak(SAMPLE, { force: true })}
            >
              🔊 Hear it
            </button>
          </div>

          <p className="mt-3 text-xs text-ink-soft">
            ✨ marks the modern, natural-sounding voices.
          </p>

          {!anyNatural && (
            <div className="mt-4 rounded-bubble bg-sunny/15 p-4 text-sm text-ink">
              <p className="font-bold">Want a friendlier voice?</p>
              <p className="mt-1 text-ink-soft">
                This device only has older robotic voices installed. Opening
                Little Tracers in <span className="font-semibold">Microsoft Edge</span>{" "}
                gives you the natural voices (including a child voice called
                Ana), and on Windows you can add more under{" "}
                <span className="font-semibold">
                  Settings → Time &amp; language → Speech
                </span>
                . iPads and Macs have excellent voices under{" "}
                <span className="font-semibold">
                  Accessibility → Spoken Content
                </span>
                .
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
