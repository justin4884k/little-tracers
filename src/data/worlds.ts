import type { Glyph } from "@/engine/types";
import { MOTOR_GLYPHS } from "./glyphs/motor";
import { UPPERCASE_GLYPHS } from "./glyphs/uppercase";
import { LOWERCASE_GLYPHS } from "./glyphs/lowercase";
import { NUMBER_GLYPHS } from "./glyphs/numbers";
import { SHAPE_GLYPHS } from "./glyphs/shapes";

export type WorldId = "playground" | "forest" | "rainbow" | "ocean" | "space";

export interface WorldTheme {
  /** Page background gradient stops. */
  from: string;
  via: string;
  to: string;
  /** Accent for buttons/cards in this world. */
  accent: string;
  accentDeep: string;
  /** Ink gradient used for completed strokes while tracing. */
  ink: string[];
}

export interface World {
  id: WorldId;
  name: string;
  emoji: string;
  /** What Pip says when the child arrives. */
  spokenWelcome: string;
  tagline: string;
  glyphs: Glyph[];
  theme: WorldTheme;
}

export const WORLDS: World[] = [
  {
    id: "playground",
    name: "Motor Skills Playground",
    emoji: "🛝",
    spokenWelcome:
      "Welcome to the playground! Let's warm up our fingers with lines and squiggles!",
    tagline: "Lines, waves & squiggles",
    glyphs: MOTOR_GLYPHS,
    theme: {
      from: "#fef3c7",
      via: "#fde68a",
      to: "#fca5a5",
      accent: "#ffc93c",
      accentDeep: "#f5a623",
      ink: ["#f59e0b", "#ef4444", "#ec4899"],
    },
  },
  {
    id: "forest",
    name: "Alphabet Forest",
    emoji: "🌳",
    spokenWelcome:
      "Welcome to Alphabet Forest! The big letters live in these trees. Which one shall we trace?",
    tagline: "Big letters A to Z",
    glyphs: UPPERCASE_GLYPHS,
    theme: {
      from: "#d9f99d",
      via: "#bbf7d0",
      to: "#99f6e4",
      accent: "#4ade80",
      accentDeep: "#22c55e",
      ink: ["#22c55e", "#14b8a6", "#84cc16"],
    },
  },
  {
    id: "rainbow",
    name: "Rainbow Town",
    emoji: "🌈",
    spokenWelcome:
      "Welcome to Rainbow Town! The little letters live in these cozy houses. Let's visit one!",
    tagline: "Little letters a to z",
    glyphs: LOWERCASE_GLYPHS,
    theme: {
      from: "#fbcfe8",
      via: "#e9d5ff",
      to: "#bfdbfe",
      accent: "#f9a8d4",
      accentDeep: "#ec4899",
      ink: ["#ec4899", "#8b5cf6", "#3b82f6"],
    },
  },
  {
    id: "ocean",
    name: "Ocean Numbers",
    emoji: "🌊",
    spokenWelcome:
      "Splash! Welcome to Ocean Numbers! The numbers are swimming with the fish. Let's count and trace!",
    tagline: "Numbers 0 to 9",
    glyphs: NUMBER_GLYPHS,
    theme: {
      from: "#bae6fd",
      via: "#a5f3fc",
      to: "#99f6e4",
      accent: "#38bdf8",
      accentDeep: "#0ea5e9",
      ink: ["#0ea5e9", "#06b6d4", "#14b8a6"],
    },
  },
  {
    id: "space",
    name: "Space Shapes",
    emoji: "🚀",
    spokenWelcome:
      "Three, two, one, blast off! Welcome to Space Shapes! Let's draw shapes among the stars!",
    tagline: "Shapes in the stars",
    glyphs: SHAPE_GLYPHS,
    theme: {
      from: "#c7d2fe",
      via: "#ddd6fe",
      to: "#fbcfe8",
      accent: "#8b5cf6",
      accentDeep: "#7c3aed",
      ink: ["#8b5cf6", "#d946ef", "#f59e0b"],
    },
  },
];

export const ALL_GLYPHS: Glyph[] = WORLDS.flatMap((w) => w.glyphs);

const glyphIndex = new Map(ALL_GLYPHS.map((g) => [g.id, g]));
const glyphWorldIndex = new Map(
  WORLDS.flatMap((w) => w.glyphs.map((g) => [g.id, w] as const))
);

export function getWorld(id: string): World | undefined {
  return WORLDS.find((w) => w.id === id);
}

export function getGlyph(id: string): Glyph | undefined {
  return glyphIndex.get(id);
}

export function getWorldForGlyph(glyphId: string): World | undefined {
  return glyphWorldIndex.get(glyphId);
}

/** The glyph after this one on its world's trail, if any. */
export function getNextGlyph(glyphId: string): Glyph | undefined {
  const world = glyphWorldIndex.get(glyphId);
  if (!world) return undefined;
  const i = world.glyphs.findIndex((g) => g.id === glyphId);
  return i >= 0 ? world.glyphs[i + 1] : undefined;
}
