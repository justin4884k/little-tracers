"use client";

import type { TraceLesson } from "@/types/learning";

const preferredVoiceNames = ["Jenny", "Aria", "Ava", "Emma", "Samantha", "Karen", "Daniel", "Moira", "Tessa", "Serena"];
const naturalVoiceTerms = ["natural", "neural", "premium", "enhanced", "online"];
const roboticVoiceTerms = ["david", "zira", "mark", "hazel", "desktop", "compact", "espeak", "robot"];

const letterSounds: Record<string, string> = {
  A: "ah",
  B: "buh",
  C: "kuh",
  D: "duh",
  E: "eh",
  F: "fff",
  G: "guh",
  H: "huh",
  I: "ih",
  J: "juh",
  K: "kuh",
  L: "lll",
  M: "mmm",
  N: "nnn",
  O: "oh",
  P: "puh",
  Q: "kwuh",
  R: "rrr",
  S: "sss",
  T: "tuh",
  U: "uh",
  V: "vvv",
  W: "wuh",
  X: "ks",
  Y: "yuh",
  Z: "zzz",
};

export function chooseNaturalVoice(voices: SpeechSynthesisVoice[], language = "en") {
  const matchingLanguage = voices.filter((voice) => voice.lang.toLowerCase().startsWith(language));
  const candidates = matchingLanguage.length > 0 ? matchingLanguage : voices;

  return (
    candidates
      .map((voice) => ({ voice, score: scoreVoice(voice) }))
      .sort((a, b) => b.score - a.score)[0]?.voice ?? null
  );
}

export function buildNarrationText(lesson: TraceLesson) {
  const glyph = lesson.glyph.toUpperCase();
  const spokenSound = lesson.kind === "letter" ? letterSounds[glyph] : null;
  const example = lesson.example ? ` ${lesson.glyph} is for ${lesson.example}.` : "";
  const sound = spokenSound ? ` It says ${spokenSound}.` : "";

  return `${lesson.prompt}${sound}${example}`;
}

export function buildNarrationParts(lesson: TraceLesson) {
  return buildNarrationText(lesson)
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function scoreVoice(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase();
  let score = voice.default ? 4 : 0;

  if (voice.lang.toLowerCase().startsWith("en-us")) score += 12;
  if (voice.lang.toLowerCase().startsWith("en")) score += 8;
  if (voice.localService) score += 4;

  preferredVoiceNames.forEach((preferred, index) => {
    if (name.includes(preferred.toLowerCase())) score += 80 - index * 3;
  });

  naturalVoiceTerms.forEach((term) => {
    if (name.includes(term)) score += 45;
  });

  roboticVoiceTerms.forEach((term) => {
    if (name.includes(term)) score -= 90;
  });

  if (name.includes("microsoft") && !naturalVoiceTerms.some((term) => name.includes(term))) {
    score -= 28;
  }

  if (name.includes("google") && name.includes("english")) {
    score += 26;
  }

  return score;
}
