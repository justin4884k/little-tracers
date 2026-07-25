import type { Glyph } from "@/engine/types";

/** Space Shapes — shapes drawn among the stars. */

const G = (
  id: string,
  spoken: string,
  phrase: string,
  strokes: string[]
): Glyph => ({
  id: `shape-${id}`,
  display: "",
  spoken,
  phrase,
  strokes: strokes.map((path) => ({ path })),
});

export const SHAPE_GLYPHS: Glyph[] = [
  G("circle", "a circle", "A circle! Round like a planet!", [
    "M50,16 C27,16 16,34 16,50 C16,66 27,84 50,84 C73,84 84,66 84,50 C84,34 73,16 50,16",
  ]),
  G("square", "a square", "A square! Like a robot's tummy!", [
    "M22,22 L78,22 L78,78 L22,78 L22,22",
  ]),
  G("triangle", "a triangle", "A triangle! Like a rocket's nose!", [
    "M50,16 L82,80 L18,80 L50,16",
  ]),
  G("rectangle", "a rectangle", "A rectangle! Like a space door!", [
    "M15,32 L85,32 L85,68 L15,68 L15,32",
  ]),
  G("oval", "an oval", "An oval! Like a flying saucer!", [
    "M50,28 C24,28 14,38 14,50 C14,62 24,72 50,72 C76,72 86,62 86,50 C86,38 76,28 50,28",
  ]),
  G("diamond", "a diamond", "A diamond! Sparkling in space!", [
    "M50,14 L82,50 L50,86 L18,50 L50,14",
  ]),
  G("star", "a star", "A star! You are a star too!", [
    "M50,12 L59,38 L87,38 L64,55 L73,83 L50,66 L27,83 L36,55 L13,38 L41,38 L50,12",
  ]),
  G("heart", "a heart", "A heart! Sending you space hugs!", [
    "M50,34 C46,20 25,21 23,38 C21,56 40,68 50,82 C60,68 79,56 77,38 C75,21 54,20 50,34",
  ]),
  G("crescent", "a crescent moon", "A crescent moon! Goodnight, stars!", [
    "M60,14 C41,22 32,36 32,50 C32,64 41,78 60,86 C40,84 20,70 20,50 C20,30 40,16 60,14",
  ]),
  G("plus", "a plus sign", "A plus! Adding more fun!", [
    "M50,18 L50,82",
    "M18,50 L82,50",
  ]),
];
