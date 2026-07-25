"use client";

/**
 * Kid-friendly wrapper around the Web Speech API.
 * Every child-facing screen narrates itself through this module, so a
 * non-reading 3-year-old can navigate the whole app by sound.
 *
 * Voice quality varies enormously between devices, so rather than matching a
 * few hard-coded names we *score* every installed voice and speak with the
 * best one available. The difference between a modern neural voice and a
 * legacy formant synthesiser is the difference between a friendly storyteller
 * and a robot, which matters more here than almost anywhere else.
 */

let muted = false;
let listenerAttached = false;

/* ------------------------------------------------------------------ *
 * Voice scoring
 * ------------------------------------------------------------------ */

/** Modern, high-fidelity synthesis engines. */
const QUALITY_BONUSES: { re: RegExp; points: number }[] = [
  { re: /\b(neural|natural)\b/i, points: 110 }, // Microsoft Natural / Azure Neural
  { re: /\b(wavenet|studio|journey|chirp)\b/i, points: 105 }, // Google Cloud
  { re: /\bsiri\b/i, points: 90 }, // Apple Siri voices
  { re: /\bpremium\b/i, points: 85 }, // Apple Premium
  { re: /\benhanced\b/i, points: 70 }, // Apple Enhanced
  { re: /^google\s/i, points: 60 }, // Chrome's network voices
  { re: /\bonline\b/i, points: 25 },
];

/** Older or deliberately low-fidelity engines. */
const QUALITY_PENALTIES: { re: RegExp; points: number }[] = [
  { re: /\b(espeak|festival|pico|flite)\b/i, points: -140 },
  { re: /\bcompact\b/i, points: -60 }, // Apple compact = low bitrate
  { re: /\bdesktop\b/i, points: -45 }, // legacy Windows SAPI5
  { re: /\b(eloquence|mobile)\b/i, points: -30 },
];

/**
 * Warm, clear voices that suit early-childhood narration. "Ana" is
 * Microsoft's genuine child voice and is the single best fit for this app.
 */
const VOICE_NAME_BONUSES: { re: RegExp; points: number }[] = [
  { re: /\bana\b/i, points: 75 },
  { re: /\b(jenny|aria|michelle|emma|ava|samantha|allison|serena|sonia|libby|clara|nova|amelie)\b/i, points: 30 },
  /**
   * A small tie-break toward the warmer, higher-register voices that
   * early-childhood media conventionally narrates with. Deliberately far
   * smaller than any quality bonus, so it only decides between voices that
   * are otherwise equivalent — it never picks a robotic voice over a good one.
   */
  { re: /\b(female|woman|zira|hazel|susan|linda|heera|catherine|karen|moira|tessa|fiona|veena|victoria|joanna|salli|kimberly)\b/i, points: 18 },
];

/**
 * Novelty and legacy joke voices (mostly classic macOS). These are actively
 * unpleasant or unintelligible for a young child and are never used.
 */
const EXCLUDED = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|jester|organ|trinoids|whisper|zarvox|wobble|superstar|junior|kathy|princess|ralph|fred|agnes|bruce|hysterical|pipe organ)\b/i;

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name;
  if (EXCLUDED.test(name)) return -Infinity;

  const lang = voice.lang.toLowerCase();
  if (!lang.startsWith("en")) return -Infinity;

  let score = 0;
  if (/^en[-_](us|gb)/.test(lang)) score += 15;

  for (const { re, points } of QUALITY_BONUSES) if (re.test(name)) score += points;
  for (const { re, points } of QUALITY_PENALTIES) if (re.test(name)) score += points;
  for (const { re, points } of VOICE_NAME_BONUSES) if (re.test(name)) score += points;

  if (voice.default) score += 5; // gentle tie-break only
  return score;
}

/** True when the voice comes from a modern engine that already sounds human. */
function isHighFidelity(voice: SpeechSynthesisVoice | null): boolean {
  if (!voice) return false;
  return /\b(neural|natural|siri|premium|enhanced|wavenet|studio|journey|chirp)\b/i.test(
    voice.name
  ) || /^google\s/i.test(voice.name);
}

/* ------------------------------------------------------------------ *
 * Voice selection
 * ------------------------------------------------------------------ */

let bestAnyVoice: SpeechSynthesisVoice | null = null;
let bestLocalVoice: SpeechSynthesisVoice | null = null;
let preferredVoiceURI: string | null = null;

function refreshVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return;

  const ranked = voices
    .map((voice) => ({ voice, score: scoreVoice(voice) }))
    .filter((entry) => entry.score > -Infinity)
    .sort((a, b) => b.score - a.score);

  bestAnyVoice = ranked[0]?.voice ?? voices[0] ?? null;
  bestLocalVoice = ranked.find((entry) => entry.voice.localService)?.voice ?? bestAnyVoice;
}

function ensureVoicesLoaded() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!listenerAttached) {
    listenerAttached = true;
    // Voices populate asynchronously in Chrome; re-rank whenever that happens.
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
  }
  if (!bestAnyVoice) refreshVoices();
}

/**
 * The voice to speak with right now.
 *
 * The best-sounding voices are often network-backed, which is a problem for an
 * offline-first app, so when the device is offline we fall back to the best
 * voice that runs on-device.
 */
function currentVoice(): SpeechSynthesisVoice | null {
  ensureVoicesLoaded();

  if (preferredVoiceURI) {
    const chosen = window.speechSynthesis
      .getVoices()
      .find((v) => v.voiceURI === preferredVoiceURI);
    if (chosen && (chosen.localService || navigator.onLine !== false)) return chosen;
  }

  if (navigator.onLine === false) return bestLocalVoice;
  return bestAnyVoice;
}

/** Voices a grown-up can choose between, best first. */
export function listVoices(): SpeechSynthesisVoice[] {
  ensureVoicesLoaded();
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .map((voice) => ({ voice, score: scoreVoice(voice) }))
    .filter((entry) => entry.score > -Infinity)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.voice);
}

export function setPreferredVoice(voiceURI: string | null) {
  preferredVoiceURI = voiceURI;
}

export function getPreferredVoice(): string | null {
  return preferredVoiceURI;
}

/** Name of the voice actually in use, for display in the grown-ups area. */
export function activeVoiceName(): string | null {
  return currentVoice()?.name ?? null;
}

/* ------------------------------------------------------------------ *
 * Speaking
 * ------------------------------------------------------------------ */

export function setVoiceMuted(value: boolean) {
  muted = value;
  if (value) stopSpeaking();
}

export function isVoiceMuted() {
  return muted;
}

export interface SpeakOptions {
  /** Interrupt anything currently being spoken (default true). */
  interrupt?: boolean;
  rate?: number;
  pitch?: number;
  /** Speak even while muted (used by the voice preview button). */
  force?: boolean;
}

/**
 * Speak a line warmly and a little slowly.
 *
 * Prosody is matched to the voice: a neural voice already sounds human, and
 * pitch-shifting it just reintroduces the artificial edge we're trying to
 * avoid, so it is left near its natural pitch. Only older, flatter voices get
 * lifted to sound friendlier.
 */
export function speak(text: string, options: SpeakOptions = {}) {
  const { interrupt = true, force = false } = options;
  if (muted && !force) return;
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  const voice = currentVoice();
  const natural = isHighFidelity(voice);

  if (interrupt) window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;
  utterance.rate = options.rate ?? (natural ? 0.95 : 0.88);
  utterance.pitch = options.pitch ?? (natural ? 1.0 : 1.15);
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

/** Queue a line after whatever is currently speaking. */
export function speakNext(text: string, options: Omit<SpeakOptions, "interrupt"> = {}) {
  speak(text, { ...options, interrupt: false });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Some browsers only allow speech after a user gesture; calling this from the
 * landing-page tap "unlocks" the voice for the rest of the session and gives
 * Chrome a moment to populate its voice list.
 */
export function warmUpSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  ensureVoicesLoaded();
  const silent = new SpeechSynthesisUtterance(" ");
  silent.volume = 0;
  window.speechSynthesis.speak(silent);
}
