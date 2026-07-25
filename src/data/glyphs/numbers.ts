import type { Glyph } from "@/engine/types";

/** Ocean Numbers — 0 through 9. */

const G = (
  num: string,
  spoken: string,
  phrase: string,
  strokes: string[]
): Glyph => ({
  id: `num-${num}`,
  display: num,
  spoken: `the number ${spoken}`,
  phrase,
  strokes: strokes.map((path) => ({ path })),
});

export const NUMBER_GLYPHS: Glyph[] = [
  G("0", "zero", "Zero! Round like a bubble in the sea!", [
    "M50,15 C29,15 25,37 25,50 C25,63 29,85 50,85 C71,85 75,63 75,50 C75,37 71,15 50,15",
  ]),
  G("1", "one", "One! One whale waving hello!", ["M38,28 L52,15 L52,85"]),
  G("2", "two", "Two! Two turtles on the shore!", [
    "M30,30 C32,10 68,12 68,32 C68,46 50,55 30,85 L72,85",
  ]),
  G("3", "three", "Three! Three jumping dolphins!", [
    "M30,25 C42,10 69,15 68,32 C67,45 54,48 47,48 C54,48 70,52 70,67 C70,88 38,90 28,73",
  ]),
  G("4", "four", "Four! Four starfish friends!", [
    "M56,15 L26,60 L76,60",
    "M62,25 L62,85",
  ]),
  G("5", "five", "Five! Give me five, crab claws!", [
    "M36,15 L33,46 C47,38 70,43 70,63 C70,86 41,90 29,75",
    "M36,15 L68,15",
  ]),
  G("6", "six", "Six! Six silly seahorses!", [
    "M64,18 C45,20 30,40 30,58 C30,78 41,87 52,86 C65,84 70,73 67,63 C62,50 42,52 34,62",
  ]),
  G("7", "seven", "Seven! Seven splashy waves!", ["M28,15 L72,15 L44,85"]),
  G("8", "eight", "Eight! A wiggly octopus figure eight!", [
    "M50,15 C31,15 31,45 50,48 C70,52 71,85 50,85 C29,85 30,52 50,48 C69,45 69,15 50,15",
  ]),
  G("9", "nine", "Nine! Nine shiny seashells!", [
    "M67,30 C62,13 34,14 32,32 C31,50 61,53 67,38",
    "M67,22 L67,85",
  ]),
];
