"use client";

/**
 * Tiny WebAudio synthesizer — all sound effects are generated, so the app
 * ships zero audio assets and works fully offline.
 */

let ctx: AudioContext | null = null;
let muted = false;

export function setSoundMuted(value: boolean) {
  muted = value;
}

export function isSoundMuted() {
  return muted;
}

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Call from the first user tap to unlock audio on iOS/Safari. */
export function warmUpAudio() {
  getContext();
}

interface Tone {
  freq: number;
  /** seconds after now */
  at: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

function play(tones: Tone[]) {
  if (muted) return;
  const audio = getContext();
  if (!audio) return;
  const now = audio.currentTime;
  for (const tone of tones) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = tone.type ?? "sine";
    osc.frequency.setValueAtTime(tone.freq, now + tone.at);
    const peak = tone.gain ?? 0.12;
    gain.gain.setValueAtTime(0, now + tone.at);
    gain.gain.linearRampToValueAtTime(peak, now + tone.at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + tone.at + tone.duration);
    osc.connect(gain).connect(audio.destination);
    osc.start(now + tone.at);
    osc.stop(now + tone.at + tone.duration + 0.05);
  }
}

/** Soft bubble pop — buttons, pickups. */
export function playPop() {
  play([{ freq: 620, at: 0, duration: 0.09, type: "triangle", gain: 0.15 }]);
}

/** Little sparkle — checkpoint progress while tracing. */
export function playSparkle(step = 0) {
  const base = 740 + (step % 5) * 90;
  play([{ freq: base, at: 0, duration: 0.1, type: "sine", gain: 0.07 }]);
}

/** Chime — one stroke finished. */
export function playStrokeDone() {
  play([
    { freq: 660, at: 0, duration: 0.12, type: "triangle" },
    { freq: 880, at: 0.09, duration: 0.18, type: "triangle" },
  ]);
}

/** Fanfare — whole glyph finished. */
export function playFanfare() {
  play([
    { freq: 523, at: 0, duration: 0.16, type: "triangle", gain: 0.14 },
    { freq: 659, at: 0.12, duration: 0.16, type: "triangle", gain: 0.14 },
    { freq: 784, at: 0.24, duration: 0.16, type: "triangle", gain: 0.14 },
    { freq: 1047, at: 0.36, duration: 0.4, type: "triangle", gain: 0.16 },
    { freq: 1319, at: 0.5, duration: 0.35, type: "sine", gain: 0.08 },
  ]);
}

/** Warm rising encouragement — never a "wrong" buzzer. */
export function playEncourage() {
  play([
    { freq: 392, at: 0, duration: 0.14, type: "sine", gain: 0.09 },
    { freq: 494, at: 0.12, duration: 0.18, type: "sine", gain: 0.09 },
  ]);
}

/** Magical unlock — new pet, sticker, or decoration. */
export function playUnlock() {
  play([
    { freq: 880, at: 0, duration: 0.1, type: "sine", gain: 0.1 },
    { freq: 1109, at: 0.08, duration: 0.1, type: "sine", gain: 0.1 },
    { freq: 1319, at: 0.16, duration: 0.12, type: "sine", gain: 0.1 },
    { freq: 1760, at: 0.26, duration: 0.4, type: "sine", gain: 0.12 },
  ]);
}
