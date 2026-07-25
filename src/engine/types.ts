/** Shared types for glyph data and the tracing engine. */

export interface Point {
  x: number;
  y: number;
}

/** One pen stroke of a glyph, as an SVG path in a normalized 100×100 space. */
export interface GlyphStroke {
  path: string;
}

export interface Glyph {
  /** Unique id, e.g. "upper-A", "num-3", "shape-star", "motor-wave". */
  id: string;
  /** Character or symbol shown large behind the trace (empty for shapes/motor). */
  display: string;
  /** Spoken name: "the letter A", "the number three", "a star". */
  spoken: string;
  /** Fun celebration phrase: "A is for apple!" */
  phrase: string;
  strokes: GlyphStroke[];
}

export type TracePhase = "demo" | "ready" | "tracing" | "strokeDone" | "celebrating";

export interface StrokeSamples {
  points: Point[];
  length: number;
}

export interface TraceResult {
  glyphId: string;
  /** 1–3, never 0 — effort always earns a star. */
  stars: 1 | 2 | 3;
  hintsUsed: number;
  wanderRatio: number;
  durationMs: number;
}
