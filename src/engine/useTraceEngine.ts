"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Glyph, Point, TracePhase, TraceResult } from "./types";
import { distance, sampleGlyph } from "./sampler";

/** How many checkpoints ahead the pointer may "catch" (fast little fingers). */
const LOOKAHEAD = 8;
/** Multiplier on tolerance for grabbing the very first checkpoint of a stroke. */
const START_GRACE = 2.2;
/** Pointer this far off-path counts as wandering (still never an error). */
const WANDER_FACTOR = 2.0;
/** Ms of no progress while tracing before we offer a gentle hint. */
const HINT_DELAY_MS = 5000;
/** Pause between strokes so the child sees the stroke land. */
const STROKE_GAP_MS = 450;

export interface TraceEngineCallbacks {
  onProgress?: (strokeIndex: number, checkpointIndex: number) => void;
  onStrokeComplete?: (strokeIndex: number) => void;
  onGlyphComplete?: (result: TraceResult) => void;
  onHint?: () => void;
}

export interface TraceEngine {
  phase: TracePhase;
  strokeIndex: number;
  /** Checkpoint progress within the current stroke (0..points.length). */
  progressIndex: number;
  samples: ReturnType<typeof sampleGlyph>;
  /** Raw pointer trail of the current stroke, glyph space (faint honesty trail). */
  trail: Point[];
  beginDemo: () => void;
  finishDemo: () => void;
  pointerDown: (p: Point) => void;
  pointerMove: (p: Point) => void;
  pointerUp: () => void;
  reset: () => void;
}

interface EngineCore {
  phase: TracePhase;
  strokeIndex: number;
  progressIndex: number;
  pointerDown: boolean;
  /** Guards against a stroke completing more than once. */
  completedStrokes: Set<number>;
  wander: number;
  moves: number;
  hints: number;
  startedAt: number;
}

function freshCore(): EngineCore {
  return {
    phase: "demo",
    strokeIndex: 0,
    progressIndex: 0,
    pointerDown: false,
    completedStrokes: new Set(),
    wander: 0,
    moves: 0,
    hints: 0,
    startedAt: 0,
  };
}

/**
 * The tracing state machine.
 *
 * The authoritative state lives in a ref so that every pointer event — which
 * can arrive far faster than React re-renders, especially from a stylus —
 * reads and writes the true current values. React state is a render mirror
 * only. This is what keeps stroke completion exact and idempotent.
 *
 * Works entirely in normalized 100×100 glyph space; the canvas converts
 * pixels ↔ glyph units.
 *
 * Philosophy: progress pauses but never rewinds. Lifting a finger keeps
 * progress. Straying pauses advancement and eventually triggers a friendly
 * hint — there is no fail state anywhere in this file.
 */
export function useTraceEngine(
  glyph: Glyph,
  tolerance: number,
  callbacks: TraceEngineCallbacks
): TraceEngine {
  const samples = useMemo(() => sampleGlyph(glyph), [glyph]);

  const core = useRef<EngineCore>(freshCore());
  const cb = useRef(callbacks);
  cb.current = callbacks;

  // Render mirror.
  const [view, setView] = useState({
    phase: "demo" as TracePhase,
    strokeIndex: 0,
    progressIndex: 0,
  });
  const [trail, setTrail] = useState<Point[]>([]);

  const sync = useCallback(() => {
    const c = core.current;
    setView((prev) =>
      prev.phase === c.phase &&
      prev.strokeIndex === c.strokeIndex &&
      prev.progressIndex === c.progressIndex
        ? prev
        : { phase: c.phase, strokeIndex: c.strokeIndex, progressIndex: c.progressIndex }
    );
  }, []);

  /* ---------- Hint timer ---------- */
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHintTimer = useCallback(() => {
    if (hintTimer.current) {
      clearTimeout(hintTimer.current);
      hintTimer.current = null;
    }
  }, []);

  const armHintTimer = useCallback(() => {
    clearHintTimer();
    hintTimer.current = setTimeout(function fire() {
      // Only a hint given while the child is *actively tracing and stuck*
      // counts as assistance. Taking a while to begin, or pausing to look at
      // the picture, is curiosity — never something to be scored down for.
      if (core.current.phase === "tracing") core.current.hints += 1;
      cb.current.onHint?.();
      hintTimer.current = setTimeout(fire, HINT_DELAY_MS);
    }, HINT_DELAY_MS);
  }, [clearHintTimer]);

  const reset = useCallback(() => {
    clearHintTimer();
    if (gapTimer.current) clearTimeout(gapTimer.current);
    core.current = freshCore();
    setTrail([]);
    sync();
  }, [clearHintTimer, sync]);

  useEffect(() => {
    reset();
  }, [glyph.id, reset]);

  useEffect(
    () => () => {
      clearHintTimer();
      if (gapTimer.current) clearTimeout(gapTimer.current);
    },
    [clearHintTimer]
  );

  /* ---------- Phase transitions ---------- */

  /**
   * Replay the demonstration from the stroke the child is currently on.
   * Strokes already finished stay finished — asking to see how again should
   * never cost a child the work they've already done.
   */
  const beginDemo = useCallback(() => {
    clearHintTimer();
    if (gapTimer.current) clearTimeout(gapTimer.current);
    const c = core.current;
    c.phase = "demo";
    c.progressIndex = 0;
    c.pointerDown = false;
    setTrail([]);
    sync();
  }, [clearHintTimer, sync]);

  const finishDemo = useCallback(() => {
    const c = core.current;
    if (c.phase !== "demo") return;
    c.phase = "ready";
    c.startedAt = Date.now();
    sync();
    armHintTimer();
  }, [armHintTimer, sync]);

  const completeStroke = useCallback(
    (finishedStroke: number) => {
      const c = core.current;
      // Idempotent: a stroke can only ever be finished once per attempt.
      if (c.completedStrokes.has(finishedStroke)) return;
      c.completedStrokes.add(finishedStroke);

      clearHintTimer();
      c.pointerDown = false;
      setTrail([]);
      cb.current.onStrokeComplete?.(finishedStroke);

      const isLast = finishedStroke + 1 >= samples.length;

      if (!isLast) {
        c.phase = "strokeDone";
        sync();
        if (gapTimer.current) clearTimeout(gapTimer.current);
        gapTimer.current = setTimeout(() => {
          const cc = core.current;
          if (cc.phase !== "strokeDone") return;
          cc.strokeIndex = finishedStroke + 1;
          cc.progressIndex = 0;
          cc.phase = "ready";
          sync();
          armHintTimer();
        }, STROKE_GAP_MS);
        return;
      }

      c.phase = "celebrating";
      sync();
      const wanderRatio = c.moves > 0 ? c.wander / c.moves : 0;
      let stars: 1 | 2 | 3 = 1;
      if (wanderRatio < 0.14 && c.hints === 0) stars = 3;
      else if (wanderRatio < 0.35 && c.hints <= 2) stars = 2;
      cb.current.onGlyphComplete?.({
        glyphId: glyph.id,
        stars,
        hintsUsed: c.hints,
        wanderRatio,
        durationMs: Date.now() - c.startedAt,
      });
    },
    [samples.length, glyph.id, armHintTimer, clearHintTimer, sync]
  );

  /* ---------- Pointer handling ---------- */

  const tryAdvance = useCallback(
    (p: Point, from: number, stroke: number): number => {
      const points = samples[stroke]?.points;
      if (!points) return -1;
      let best = -1;
      const maxIdx = Math.min(from + LOOKAHEAD, points.length - 1);
      for (let i = from; i <= maxIdx; i++) {
        if (distance(p, points[i]) <= tolerance) best = i;
      }
      return best;
    },
    [samples, tolerance]
  );

  const pointerDown = useCallback(
    (p: Point) => {
      const c = core.current;
      if (c.phase !== "ready" && c.phase !== "tracing") return;

      const points = samples[c.strokeIndex]?.points;
      if (!points) return;
      const target = points[Math.min(c.progressIndex, points.length - 1)];

      // Generous grab zone: near the next checkpoint, or anywhere just ahead.
      if (
        distance(p, target) <= tolerance * START_GRACE ||
        tryAdvance(p, c.progressIndex, c.strokeIndex) >= 0
      ) {
        c.pointerDown = true;
        c.phase = "tracing";
        setTrail([p]);
        sync();
      }
    },
    [samples, tolerance, tryAdvance, sync]
  );

  const pointerMove = useCallback(
    (p: Point) => {
      const c = core.current;
      if (!c.pointerDown || c.phase !== "tracing") return;

      setTrail((t) => (t.length > 180 ? [...t.slice(-179), p] : [...t, p]));
      c.moves += 1;

      const stroke = c.strokeIndex;
      const points = samples[stroke]?.points;
      if (!points) return;

      const matched = tryAdvance(p, c.progressIndex, stroke);
      if (matched >= 0) {
        const next = matched + 1;
        if (next !== c.progressIndex) {
          c.progressIndex = next;
          sync();
          armHintTimer();
          cb.current.onProgress?.(stroke, next);
        }
        if (next >= points.length) completeStroke(stroke);
      } else {
        const target = points[Math.min(c.progressIndex, points.length - 1)];
        if (distance(p, target) > tolerance * WANDER_FACTOR) c.wander += 1;
      }
    },
    [samples, tolerance, tryAdvance, completeStroke, armHintTimer, sync]
  );

  const pointerUp = useCallback(() => {
    const c = core.current;
    c.pointerDown = false;
    // Progress is kept — lifting a finger is never a mistake.
    if (c.phase === "tracing") c.phase = "ready";
    setTrail([]);
    sync();
  }, [sync]);

  return {
    phase: view.phase,
    strokeIndex: view.strokeIndex,
    progressIndex: view.progressIndex,
    samples,
    trail,
    beginDemo,
    finishDemo,
    pointerDown,
    pointerMove,
    pointerUp,
    reset,
  };
}
