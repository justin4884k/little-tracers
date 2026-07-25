"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Line, Circle, Arrow, Text, Group } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Glyph, Point, StrokeSamples, TracePhase } from "@/engine/types";

interface TraceStageProps {
  glyph: Glyph;
  samples: StrokeSamples[];
  phase: TracePhase;
  strokeIndex: number;
  progressIndex: number;
  trail: Point[];
  /** Canvas size in px (always square). */
  size: number;
  inkColors: string[];
  accent: string;
  onDemoComplete: () => void;
  onPointerDown: (p: Point) => void;
  onPointerMove: (p: Point) => void;
  onPointerUp: () => void;
}

/** Visual widths in glyph units (glyph space is 100×100). */
const TRACK_WIDTH = 13;
const INK_WIDTH = 9.5;
const DEMO_SPEED = 55; // glyph units per second

function toFlat(points: Point[], scale: number): number[] {
  const flat: number[] = [];
  for (const p of points) flat.push(p.x * scale, p.y * scale);
  return flat;
}

/**
 * The tracing canvas. Pure presentation: the engine hook owns all state;
 * this component converts pixels ↔ glyph units and draws the magic.
 */
export function TraceStage({
  glyph,
  samples,
  phase,
  strokeIndex,
  progressIndex,
  trail,
  size,
  inkColors,
  accent,
  onDemoComplete,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: TraceStageProps) {
  const scale = size / 100;

  /* ---------- Demo animation (a spark flies each stroke in order) ---------- */
  const [demo, setDemo] = useState({ stroke: 0, t: 0 });
  const demoDone = useRef(false);

  useEffect(() => {
    if (phase !== "demo") return;
    demoDone.current = false;

    let raf = 0;
    let last = performance.now();
    // Demonstrate from the stroke the child is on, so replaying the demo
    // part-way through a letter doesn't undo the strokes they finished.
    const fromStroke = strokeIndex;
    let stroke = fromStroke;
    let t = 0;
    let first = true;

    const tick = (now: number) => {
      if (first) {
        // Reset inside the animation frame rather than synchronously in the
        // effect body, so starting the demo costs no extra render pass.
        first = false;
        last = now;
        setDemo({ stroke: fromStroke, t: 0 });
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = (now - last) / 1000;
      last = now;
      const length = samples[stroke]?.length ?? 1;
      t += (DEMO_SPEED * dt) / length;
      if (t >= 1) {
        if (stroke + 1 < samples.length) {
          stroke += 1;
          t = 0;
        } else if (!demoDone.current) {
          demoDone.current = true;
          setDemo({ stroke, t: 1 });
          setTimeout(onDemoComplete, 500);
          return;
        }
      }
      setDemo({ stroke, t: Math.min(t, 1) });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // Intentionally not re-running on strokeIndex: the demo reads it once at
    // the start and then drives its own stroke cursor to the end.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, glyph.id]);

  /* ---------- Pointer plumbing ---------- */
  const stageRef = useRef<Konva.Stage>(null);

  const pointerToGlyph = (): Point | null => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return null;
    return { x: pos.x / scale, y: pos.y / scale };
  };

  /**
   * True when the finger/stylus is genuinely in contact (or a mouse button is
   * held). An Apple Pencil hovering above an iPad, and a mouse simply moving
   * across the canvas, both emit pointermove with no buttons pressed — without
   * this check a hover would quietly draw the whole letter for the child.
   */
  const isPressed = (evt: PointerEvent | MouseEvent | TouchEvent): boolean => {
    if ("buttons" in evt && typeof evt.buttons === "number") return evt.buttons > 0;
    return true; // touch events only fire while in contact
  };

  const handleDown = (e: KonvaEventObject<PointerEvent>) => {
    const p = pointerToGlyph();
    if (p) onPointerDown(p);
    e.evt?.preventDefault?.();
  };

  const handleMove = (e: KonvaEventObject<PointerEvent>) => {
    // A move without contact ends the stroke rather than continuing it.
    if (e.evt && !isPressed(e.evt)) {
      onPointerUp();
      return;
    }
    const p = pointerToGlyph();
    if (p) onPointerMove(p);
  };

  /* ---------- Derived drawing data ---------- */
  const currentPoints = useMemo(
    () => samples[strokeIndex]?.points ?? [],
    [samples, strokeIndex]
  );
  const progressPoints = useMemo(
    () => currentPoints.slice(0, Math.max(progressIndex, 0)),
    [currentPoints, progressIndex]
  );
  const tip =
    progressPoints.length > 0
      ? progressPoints[progressPoints.length - 1]
      : currentPoints[0];

  const startPoint = currentPoints[0];
  const arrowTarget = currentPoints[Math.min(6, currentPoints.length - 1)];

  const gradientProps = (points: Point[]) =>
    points.length >= 2
      ? {
          strokeLinearGradientStartPoint: {
            x: points[0].x * scale,
            y: points[0].y * scale,
          },
          strokeLinearGradientEndPoint: {
            x: points[points.length - 1].x * scale,
            y: points[points.length - 1].y * scale,
          },
          strokeLinearGradientColorStops: [
            0,
            inkColors[0],
            0.5,
            inkColors[1] ?? inkColors[0],
            1,
            inkColors[2] ?? inkColors[0],
          ],
        }
      : { stroke: inkColors[0] };

  const showChild = phase === "ready" || phase === "tracing" || phase === "strokeDone";
  const isDemo = phase === "demo";

  const demoPoints = useMemo(() => {
    if (!isDemo) return [];
    const pts = samples[demo.stroke]?.points ?? [];
    return pts.slice(0, Math.max(2, Math.floor(pts.length * demo.t)));
  }, [isDemo, demo, samples]);

  return (
    <Stage
      ref={stageRef}
      width={size}
      height={size}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Static layer: the soft letter track. Its own canvas, so the pale
          guide is never re-rasterised while the child is drawing. */}
      <Layer listening={false}>
        {samples.map((stroke, i) => (
          <Line
            key={`track-${i}`}
            points={toFlat(stroke.points, scale)}
            stroke="#e6e0f2"
            strokeWidth={TRACK_WIDTH * scale}
            lineCap="round"
            lineJoin="round"
          />
        ))}
      </Layer>

      {/* Dynamic layer: everything that changes as the child traces. */}
      <Layer listening={false}>
        {/* Completed strokes in rainbow ink (all of them once celebrating) */}
        {samples.slice(0, phase === "celebrating" ? samples.length : strokeIndex).map((stroke, i) => (
          <Line
            key={`done-${i}`}
            points={toFlat(stroke.points, scale)}
            strokeWidth={INK_WIDTH * scale}
            lineCap="round"
            lineJoin="round"
            {...gradientProps(stroke.points)}
          />
        ))}

        {/* Current stroke: glowing dashed invitation */}
        {showChild && currentPoints.length > 0 && (
          <Line
            points={toFlat(currentPoints, scale)}
            stroke={accent}
            strokeWidth={2.6 * scale}
            dash={[0.5 * scale, 5 * scale]}
            lineCap="round"
            lineJoin="round"
            shadowColor={accent}
            shadowBlur={8}
            opacity={0.9}
          />
        )}

        {/* Progress ink (magnetic — always beautiful) */}
        {showChild && progressPoints.length >= 2 && (
          <Line
            points={toFlat(progressPoints, scale)}
            strokeWidth={INK_WIDTH * scale}
            lineCap="round"
            lineJoin="round"
            shadowColor={inkColors[0]}
            shadowBlur={6}
            {...gradientProps(currentPoints)}
          />
        )}

        {/* Honesty trail: the child's real finger path, whisper-faint */}
        {showChild && trail.length >= 2 && (
          <Line
            points={toFlat(trail, scale)}
            stroke="#3d3357"
            strokeWidth={1.2 * scale}
            lineCap="round"
            lineJoin="round"
            opacity={0.12}
          />
        )}

        {/* Start badge + direction arrow for the current stroke */}
        {showChild && startPoint && progressIndex < 4 && (
          <Group>
            {arrowTarget && (
              <Arrow
                points={[
                  startPoint.x * scale,
                  startPoint.y * scale,
                  arrowTarget.x * scale,
                  arrowTarget.y * scale,
                ]}
                stroke={accent}
                fill={accent}
                strokeWidth={1.6 * scale}
                pointerLength={3.2 * scale}
                pointerWidth={3.2 * scale}
                opacity={0.85}
              />
            )}
            <Circle
              x={startPoint.x * scale}
              y={startPoint.y * scale}
              radius={5.4 * scale}
              fill={accent}
              shadowColor={accent}
              shadowBlur={12}
              stroke="#ffffff"
              strokeWidth={1.2 * scale}
            />
            <Text
              x={(startPoint.x - 5.4) * scale}
              y={(startPoint.y - 3.4) * scale}
              width={10.8 * scale}
              align="center"
              text={String(strokeIndex + 1)}
              fontSize={6.5 * scale}
              fontStyle="bold"
              fill="#ffffff"
              listening={false}
            />
          </Group>
        )}

        {/* Sparkle tip while tracing */}
        {phase === "tracing" && tip && (
          <Group>
            <Circle
              x={tip.x * scale}
              y={tip.y * scale}
              radius={6 * scale}
              fill={accent}
              opacity={0.35}
            />
            <Circle
              x={tip.x * scale}
              y={tip.y * scale}
              radius={3 * scale}
              fill="#ffffff"
              shadowColor={accent}
              shadowBlur={14}
            />
          </Group>
        )}

        {/* Demo: the spark shows how */}
        {isDemo && (
          <Group>
            {/* Strokes below strokeIndex are already inked as the child's own
                work, so the demo only paints what it has replayed itself. */}
            {samples.slice(strokeIndex, demo.stroke).map((stroke, i) => (
              <Line
                key={`demo-done-${strokeIndex + i}`}
                points={toFlat(stroke.points, scale)}
                strokeWidth={INK_WIDTH * scale}
                lineCap="round"
                lineJoin="round"
                opacity={0.8}
                {...gradientProps(stroke.points)}
              />
            ))}
            {demoPoints.length >= 2 && (
              <Line
                points={toFlat(demoPoints, scale)}
                strokeWidth={INK_WIDTH * scale}
                lineCap="round"
                lineJoin="round"
                opacity={0.8}
                {...gradientProps(samples[demo.stroke]?.points ?? [])}
              />
            )}
            {demoPoints.length > 0 && (
              <Circle
                x={demoPoints[demoPoints.length - 1].x * scale}
                y={demoPoints[demoPoints.length - 1].y * scale}
                radius={4.5 * scale}
                fill="#ffc93c"
                stroke="#ffffff"
                strokeWidth={1.4 * scale}
                shadowColor="#ffc93c"
                shadowBlur={16}
              />
            )}
          </Group>
        )}
      </Layer>
    </Stage>
  );
}

export default TraceStage;
