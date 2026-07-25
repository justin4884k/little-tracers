import type { Point, TraceStroke } from "@/types/learning";

export type TraceScore = {
  accuracy: number;
  coverage: number;
  success: boolean;
  message: string;
};

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function sampleStroke(stroke: TraceStroke, step = 7): Point[] {
  const samples: Point[] = [];

  for (let index = 0; index < stroke.points.length - 1; index += 1) {
    const start = stroke.points[index];
    const end = stroke.points[index + 1];
    const segmentLength = Math.max(distance(start, end), 1);
    const count = Math.max(2, Math.ceil(segmentLength / step));

    for (let sampleIndex = 0; sampleIndex <= count; sampleIndex += 1) {
      const t = sampleIndex / count;
      samples.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
      });
    }
  }

  return samples;
}

export function scoreTrace(stroke: TraceStroke, childPoints: Point[], tolerance: number): TraceScore {
  if (childPoints.length < 4) {
    return { accuracy: 0, coverage: 0, success: false, message: "Try starting at the glowing dot." };
  }

  const target = sampleStroke(stroke);
  const covered = new Set<number>();
  let closenessTotal = 0;

  for (const childPoint of childPoints) {
    let nearestDistance = Number.POSITIVE_INFINITY;
    let nearestIndex = 0;

    target.forEach((targetPoint, index) => {
      const pointDistance = distance(childPoint, targetPoint);
      if (pointDistance < nearestDistance) {
        nearestDistance = pointDistance;
        nearestIndex = index;
      }
    });

    if (nearestDistance <= tolerance) {
      covered.add(nearestIndex);
      closenessTotal += Math.max(0, 1 - nearestDistance / tolerance);
    }
  }

  // A young child can lift/reposition their finger; coverage rewards being near the path
  // without demanding adult-level smoothness or exact pixel alignment.
  const coverage = Math.round((covered.size / target.length) * 100);
  const accuracy = Math.round((closenessTotal / childPoints.length) * 100);
  const success = coverage >= 52 && accuracy >= 42;

  return {
    accuracy,
    coverage,
    success,
    message: success
      ? "Beautiful tracing!"
      : coverage < 35
        ? "Nice try. Follow the glowing road a little longer."
        : "So close. Stay near the sparkle path.",
  };
}

export function flattenPoints(points: Point[]) {
  return points.flatMap((point) => [point.x, point.y]);
}

export function revealedStrokePoints(stroke: TraceStroke, progress: number) {
  const points = sampleStroke(stroke, 5);
  const visibleCount = Math.max(2, Math.floor(points.length * Math.min(progress, 1)));
  return points.slice(0, visibleCount);
}
