import type { Glyph } from "@/engine/types";

/** Motor Skills Playground — pre-writing strokes, the very first lessons. */
export const MOTOR_GLYPHS: Glyph[] = [
  {
    id: "motor-line-down",
    display: "",
    spoken: "a line going down",
    phrase: "Whee! Down we go, like a firefighter's pole!",
    strokes: [{ path: "M50,15 L50,85" }],
  },
  {
    id: "motor-line-across",
    display: "",
    spoken: "a line going across",
    phrase: "Zoom! Straight across, like a race car!",
    strokes: [{ path: "M15,50 L85,50" }],
  },
  {
    id: "motor-slide-right",
    display: "",
    spoken: "a slide going down this way",
    phrase: "Wheee! Down the slide!",
    strokes: [{ path: "M22,20 L78,80" }],
  },
  {
    id: "motor-slide-left",
    display: "",
    spoken: "a slide going down the other way",
    phrase: "Another slide! You're getting so strong!",
    strokes: [{ path: "M78,20 L22,80" }],
  },
  {
    id: "motor-cross",
    display: "",
    spoken: "a criss cross",
    phrase: "Criss cross! Like a kiss from a butterfly!",
    strokes: [{ path: "M50,15 L50,85" }, { path: "M15,50 L85,50" }],
  },
  {
    id: "motor-curve",
    display: "",
    spoken: "a big rainbow curve",
    phrase: "A beautiful rainbow! Splendid!",
    strokes: [{ path: "M18,72 C18,30 82,30 82,72" }],
  },
  {
    id: "motor-bumps",
    display: "",
    spoken: "two bouncy bumps",
    phrase: "Boing, boing! Bouncy camel bumps!",
    strokes: [{ path: "M14,72 C14,34 42,34 42,72 C42,34 70,34 70,72" }],
  },
  {
    id: "motor-zigzag",
    display: "",
    spoken: "a zippy zigzag",
    phrase: "Zig! Zag! Zoom! Like lightning!",
    strokes: [{ path: "M15,70 L32,30 L49,70 L66,30 L83,70" }],
  },
  {
    id: "motor-wave",
    display: "",
    spoken: "a wiggly wave",
    phrase: "Splish splash! Waves on the sea!",
    strokes: [{ path: "M12,55 C22,30 32,30 42,55 C52,80 62,80 72,55 C77,42 82,40 88,45" }],
  },
  {
    id: "motor-circle",
    display: "",
    spoken: "a big round circle",
    phrase: "Round and round! A perfect bubble!",
    strokes: [
      {
        path: "M50,16 C27,16 16,34 16,50 C16,66 27,84 50,84 C73,84 84,66 84,50 C84,34 73,16 50,16",
      },
    ],
  },
];
