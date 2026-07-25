"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Arrow, Circle as KonvaCircle, Group, Layer, Line, Stage, Text } from "react-konva";
import type Konva from "konva";
import type { Point, TraceLesson } from "@/types/learning";
import { flattenPoints, revealedStrokePoints, sampleStroke, scoreTrace } from "@/lib/tracing";

type TraceCanvasProps = {
  lesson: TraceLesson;
  assist: number;
  highContrast: boolean;
  leftHanded: boolean;
  onComplete: (accuracy: number) => void;
};

const CANVAS_SIZE = 360;

export function TraceCanvas({ lesson, assist, highContrast, leftHanded, onComplete }: TraceCanvasProps) {
  const [currentStroke, setCurrentStroke] = useState(0);
  const [childPoints, setChildPoints] = useState<Point[]>([]);
  const [savedLines, setSavedLines] = useState<Point[][]>([]);
  const [drawing, setDrawing] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [hint, setHint] = useState(lesson.prompt);
  const [celebrating, setCelebrating] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);

  const stroke = lesson.strokes[currentStroke];
  const tolerance = 18 + Math.round(assist * 0.32);
  const demoPoints = useMemo(() => (stroke ? revealedStrokePoints(stroke, demoProgress) : []), [stroke, demoProgress]);

  useEffect(() => {
    let frame = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const next = ((now - started) % 1800) / 1800;
      setDemoProgress(next);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [currentStroke]);

  const pointerPoint = () => {
    const stage = stageRef.current;
    const position = stage?.getPointerPosition();
    if (!position) return null;
    return { x: position.x, y: position.y };
  };

  const beginTrace = () => {
    const point = pointerPoint();
    if (!point || !stroke) return;

    const start = stroke.points[0];
    const startDistance = Math.hypot(point.x - start.x, point.y - start.y);
    if (startDistance > tolerance + 26) {
      setHint("Find the glowing dot first.");
      return;
    }

    setDrawing(true);
    setChildPoints([point]);
    setHint(stroke.label);
  };

  const continueTrace = () => {
    if (!drawing) return;
    const point = pointerPoint();
    if (!point) return;
    setChildPoints((points) => [...points, point]);
  };

  const finishTrace = () => {
    if (!drawing || !stroke) return;
    setDrawing(false);
    const result = scoreTrace(stroke, childPoints, tolerance);
    setHint(result.message);

    if (!result.success) return;

    const nextLines = [...savedLines, childPoints];
    setSavedLines(nextLines);
    setChildPoints([]);

    if (currentStroke < lesson.strokes.length - 1) {
      setCurrentStroke((value) => value + 1);
      setHint("Great. Try the next glowing road.");
      return;
    }

    const totalAccuracy = Math.max(result.accuracy, Math.round((nextLines.length / lesson.strokes.length) * 84));
    setCelebrating(true);
    window.setTimeout(() => onComplete(totalAccuracy), 850);
  };

  const reset = () => {
    setCurrentStroke(0);
    setChildPoints([]);
    setSavedLines([]);
    setHint(lesson.prompt);
    setCelebrating(false);
  };

  const activeColor = highContrast ? "#111827" : "#6D28D9";
  const glowColor = highContrast ? "#FACC15" : "#FFE66D";

  return (
    <section className="trace-panel" aria-label={`${lesson.title} tracing canvas`}>
      <div className="trace-toolbar">
        <div>
          <p className="micro-label">Practice road</p>
          <h2>{lesson.title}</h2>
        </div>
        <button className="icon-button" type="button" onClick={reset} aria-label="Try again">
          <RotateCcw size={26} />
        </button>
      </div>

      <div className={`canvas-wrap ${leftHanded ? "left-handed" : ""}`}>
        <Stage
          ref={stageRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onMouseDown={beginTrace}
          onTouchStart={beginTrace}
          onPointerDown={beginTrace}
          onMouseMove={continueTrace}
          onTouchMove={continueTrace}
          onPointerMove={continueTrace}
          onMouseUp={finishTrace}
          onTouchEnd={finishTrace}
          onPointerUp={finishTrace}
        >
          <Layer>
            <Text
              text={lesson.glyph}
              x={0}
              y={12}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              align="center"
              verticalAlign="middle"
              fontSize={lesson.glyph.length > 1 ? 118 : 226}
              fontFamily="Arial Rounded MT Bold, Arial, sans-serif"
              fill={highContrast ? "#E5E7EB" : "#F8D9FF"}
            />

            {lesson.strokes.map((lessonStroke, index) => {
              const targetSamples = sampleStroke(lessonStroke, 8);
              const isActive = index === currentStroke;
              return (
                <Group key={lessonStroke.id}>
                  <Line
                    points={flattenPoints(targetSamples)}
                    stroke={isActive ? glowColor : highContrast ? "#CBD5E1" : "#B7F4D8"}
                    strokeWidth={isActive ? 25 : 18}
                    tension={0.48}
                    lineCap="round"
                    lineJoin="round"
                    opacity={isActive ? 0.9 : 0.62}
                    shadowColor={glowColor}
                    shadowBlur={isActive ? 18 : 0}
                  />
                  <Line
                    points={flattenPoints(targetSamples)}
                    stroke={highContrast ? "#111827" : "#FFFFFF"}
                    strokeWidth={5}
                    tension={0.48}
                    lineCap="round"
                    dash={[12, 16]}
                    opacity={0.75}
                  />
                  {isActive && targetSamples.length > 5 ? (
                    <Arrow
                      points={flattenPoints(targetSamples.slice(Math.max(1, targetSamples.length - 7)))}
                      stroke={activeColor}
                      fill={activeColor}
                      strokeWidth={6}
                      pointerLength={16}
                      pointerWidth={16}
                      lineCap="round"
                    />
                  ) : null}
                </Group>
              );
            })}

            {stroke ? (
              <>
                <Line
                  points={flattenPoints(demoPoints)}
                  stroke="#FF5B7F"
                  strokeWidth={10}
                  tension={0.48}
                  lineCap="round"
                  shadowColor="#FF5B7F"
                  shadowBlur={12}
                />
                <KonvaCircle x={stroke.points[0].x} y={stroke.points[0].y} radius={17} fill="#34D399" shadowBlur={16} shadowColor="#34D399" />
              </>
            ) : null}

            {savedLines.map((line, index) => (
              <Line key={index} points={flattenPoints(line)} stroke="#18A999" strokeWidth={14} tension={0.42} lineCap="round" />
            ))}
            <Line points={flattenPoints(childPoints)} stroke="#F97316" strokeWidth={14} tension={0.42} lineCap="round" />
          </Layer>
        </Stage>

        <AnimatePresence>
          {celebrating ? (
            <motion.div
              className="canvas-celebration"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Sparkles size={48} />
              <span>Super tracing!</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <motion.p className="trace-hint" key={hint} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {hint}
      </motion.p>
    </section>
  );
}
