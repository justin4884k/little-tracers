import { svgPathProperties } from "svg-path-properties";
import type { Glyph, Point, StrokeSamples } from "./types";

/** Distance between checkpoints, in glyph units (glyph space is 100×100). */
const SAMPLE_SPACING = 3;

const cache = new Map<string, StrokeSamples>();

/** Sample an SVG path (in 100×100 glyph space) into ordered checkpoints. */
export function sampleStroke(path: string): StrokeSamples {
  const cached = cache.get(path);
  if (cached) return cached;

  const props = new svgPathProperties(path);
  const length = props.getTotalLength();
  const count = Math.max(2, Math.ceil(length / SAMPLE_SPACING));
  const points: Point[] = [];
  for (let i = 0; i <= count; i++) {
    const p = props.getPointAtLength((length * i) / count);
    points.push({ x: p.x, y: p.y });
  }

  const samples = { points, length };
  cache.set(path, samples);
  return samples;
}

export function sampleGlyph(glyph: Glyph): StrokeSamples[] {
  return glyph.strokes.map((s) => sampleStroke(s.path));
}

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
