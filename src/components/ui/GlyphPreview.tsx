import type { Glyph } from "@/engine/types";

interface GlyphPreviewProps {
  glyph: Glyph;
  /** Stroke color. */
  color?: string;
  strokeWidth?: number;
  className?: string;
  /** Dashed "traceable" look for worksheets. */
  dashed?: boolean;
}

/** Tiny static rendering of a glyph from its stroke paths (SVG, server-safe). */
export function GlyphPreview({
  glyph,
  color = "#3d3357",
  strokeWidth = 8,
  className = "",
  dashed = false,
}: GlyphPreviewProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {glyph.strokes.map((s, i) => (
        <path
          key={i}
          d={s.path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dashed ? "1 12" : undefined}
        />
      ))}
    </svg>
  );
}
