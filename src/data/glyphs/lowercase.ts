import type { Glyph } from "@/engine/types";

/**
 * Rainbow Town — lowercase a–z.
 * Baseline at y=85, x-height at y≈45, ascenders reach 15, descenders reach 98.
 */

const G = (letter: string, phrase: string, strokes: string[]): Glyph => ({
  id: `lower-${letter}`,
  display: letter,
  spoken: `the little letter ${letter}`,
  phrase,
  strokes: strokes.map((path) => ({ path })),
});

export const LOWERCASE_GLYPHS: Glyph[] = [
  G("a", "Little a, for ant! March march!", [
    "M63,50 C56,42 30,42 29,64 C29,85 58,88 63,74",
    "M64,46 L64,85",
  ]),
  G("b", "Little b, for bee! Buzz buzz!", [
    "M33,15 L33,85",
    "M33,52 C46,42 69,48 69,65 C69,83 45,88 33,77",
  ]),
  G("c", "Little c, for cat! Meow!", [
    "M66,52 C57,41 33,42 32,64 C33,85 58,87 66,75",
  ]),
  G("d", "Little d, for duck! Quack quack!", [
    "M62,52 C54,42 30,44 30,64 C31,84 55,87 62,76",
    "M64,15 L64,85",
  ]),
  G("e", "Little e, for egg! Crack!", [
    "M32,62 L67,62 C67,44 34,40 31,60 C28,82 55,90 66,77",
  ]),
  G("f", "Little f, for fish! Blub blub!", [
    "M64,22 C50,10 42,20 42,32 L42,85",
    "M30,48 L58,48",
  ]),
  G("g", "Little g, for goat! Nibble nibble!", [
    "M62,50 C55,42 30,42 29,63 C29,83 56,86 62,74",
    "M63,46 L63,86 C63,99 43,101 36,93",
  ]),
  G("h", "Little h, for hat! Tip tip!", [
    "M33,15 L33,85",
    "M33,55 C41,43 63,44 63,61 L63,85",
  ]),
  G("i", "Little i, for igloo! Brrr!", ["M50,45 L50,85", "M50,28 L50,33"]),
  G("j", "Little j, for jam! Sticky sweet!", [
    "M58,45 L58,86 C58,99 39,101 33,92",
    "M58,28 L58,33",
  ]),
  G("k", "Little k, for kite! Fly high!", [
    "M33,15 L33,85",
    "M61,45 L33,65",
    "M43,58 L63,85",
  ]),
  G("l", "Little l, for lemon! So sour!", ["M50,15 L50,85"]),
  G("m", "Little m, for mouse! Squeak!", [
    "M28,45 L28,85",
    "M28,55 C33,43 48,44 48,58 L48,85",
    "M48,55 C53,43 68,44 68,58 L68,85",
  ]),
  G("n", "Little n, for nose! Sniff sniff!", [
    "M33,45 L33,85",
    "M33,56 C39,43 64,44 64,60 L64,85",
  ]),
  G("o", "Little o, for otter! Splash!", [
    "M50,44 C33,44 28,54 28,64 C28,79 39,86 50,86 C61,86 72,79 72,64 C72,54 67,44 50,44",
  ]),
  G("p", "Little p, for puppy! Woof woof!", [
    "M33,45 L33,98",
    "M33,53 C45,42 69,47 69,64 C69,82 45,86 33,76",
  ]),
  G("q", "Little q, for quilt! Cozy cozy!", [
    "M62,50 C55,42 30,42 29,63 C29,83 56,86 62,74",
    "M63,46 L63,98",
  ]),
  G("r", "Little r, for robot! Beep boop!", [
    "M36,45 L36,85",
    "M36,58 C42,44 56,42 64,49",
  ]),
  G("s", "Little s, for star! Twinkle twinkle!", [
    "M63,50 C55,42 36,42 35,52 C35,61 49,61 55,65 C63,69 63,78 52,82 C42,85 34,80 32,73",
  ]),
  G("t", "Little t, for turtle! Slow and steady!", [
    "M46,22 L46,76 C46,85 54,86 60,82",
    "M32,44 L62,44",
  ]),
  G("u", "Little u, for unicorn! Magical!", [
    "M32,45 L32,66 C32,85 60,85 62,68 L62,45",
    "M62,45 L62,85",
  ]),
  G("v", "Little v, for violin! La la la!", ["M30,45 L50,85 L70,45"]),
  G("w", "Little w, for worm! Wiggle wiggle!", [
    "M24,45 L37,85 L50,55 L63,85 L76,45",
  ]),
  G("x", "Little x, for fox tracks! Sneak sneak!", [
    "M32,45 L68,85",
    "M68,45 L32,85",
  ]),
  G("y", "Little y, for yawn! So sleepy!", [
    "M30,45 L50,80",
    "M70,45 L40,98",
  ]),
  G("z", "Little z, for zoom! Fast fast!", ["M32,45 L68,45 L32,85 L68,85"]),
];
