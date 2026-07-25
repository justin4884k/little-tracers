import type { Glyph } from "@/engine/types";

/**
 * Alphabet Forest — uppercase A–Z.
 * Stroke order follows common print handwriting instruction
 * (top-to-bottom, left-to-right, verticals before crossbars).
 * Paths live in a normalized 100×100 space.
 */

const G = (
  letter: string,
  phrase: string,
  strokes: string[]
): Glyph => ({
  id: `upper-${letter}`,
  display: letter,
  spoken: `the big letter ${letter}`,
  phrase,
  strokes: strokes.map((path) => ({ path })),
});

export const UPPERCASE_GLYPHS: Glyph[] = [
  G("A", "A is for apple! Crunch crunch!", [
    "M50,15 L22,85",
    "M50,15 L78,85",
    "M33,58 L67,58",
  ]),
  G("B", "B is for bunny! Boing boing!", [
    "M30,15 L30,85",
    "M30,15 C68,15 68,48 30,50",
    "M30,50 C72,50 72,85 30,85",
  ]),
  G("C", "C is for cookie! Yum yum!", [
    "M74,27 C58,10 24,16 22,50 C24,84 58,90 74,73",
  ]),
  G("D", "D is for dinosaur! Rawr!", [
    "M30,15 L30,85",
    "M30,15 C78,18 78,82 30,85",
  ]),
  G("E", "E is for elephant! Ta-doo!", [
    "M32,15 L32,85",
    "M32,15 L72,15",
    "M32,50 L64,50",
    "M32,85 L72,85",
  ]),
  G("F", "F is for fox! So sneaky!", [
    "M32,15 L32,85",
    "M32,15 L72,15",
    "M32,50 L62,50",
  ]),
  G("G", "G is for giggle! Hee hee!", [
    "M75,27 C58,10 24,16 22,50 C24,84 58,90 73,72 C75,66 76,60 76,54 L52,54",
  ]),
  G("H", "H is for hug! Big squeeze!", [
    "M28,15 L28,85",
    "M72,15 L72,85",
    "M28,50 L72,50",
  ]),
  G("I", "I is for ice cream! Brain freeze!", [
    "M50,15 L50,85",
    "M32,15 L68,15",
    "M32,85 L68,85",
  ]),
  G("J", "J is for jellyfish! Wibble wobble!", [
    "M64,15 L64,66 C64,88 34,88 32,68",
    "M44,15 L84,15",
  ]),
  G("K", "K is for kangaroo! Hop hop!", [
    "M30,15 L30,85",
    "M70,15 L30,52",
    "M43,42 L72,85",
  ]),
  G("L", "L is for lion! Roar!", ["M32,15 L32,85 L72,85"]),
  G("M", "M is for moon! Goodnight!", [
    "M24,85 L24,15",
    "M24,15 L50,62",
    "M50,62 L76,15",
    "M76,15 L76,85",
  ]),
  G("N", "N is for nest! Tweet tweet!", [
    "M28,85 L28,15",
    "M28,15 L72,85",
    "M72,85 L72,15",
  ]),
  G("O", "O is for octopus! Wiggly arms!", [
    "M50,15 C26,15 17,34 17,50 C17,66 26,85 50,85 C74,85 83,66 83,50 C83,34 74,15 50,15",
  ]),
  G("P", "P is for penguin! Waddle waddle!", [
    "M30,15 L30,85",
    "M30,15 C72,15 72,52 30,53",
  ]),
  G("Q", "Q is for queen! Your majesty!", [
    "M50,15 C26,15 17,34 17,50 C17,66 26,85 50,85 C74,85 83,66 83,50 C83,34 74,15 50,15",
    "M60,66 L80,88",
  ]),
  G("R", "R is for rocket! Blast off!", [
    "M30,15 L30,85",
    "M30,15 C72,15 72,50 30,52",
    "M44,52 L74,85",
  ]),
  G("S", "S is for sunshine! Warm and bright!", [
    "M72,26 C58,10 28,14 28,31 C28,45 46,47 55,51 C68,56 74,68 62,79 C48,90 30,84 25,72",
  ]),
  G("T", "T is for tiger! Stripes!", ["M50,15 L50,85", "M24,15 L76,15"]),
  G("U", "U is for umbrella! Pitter patter!", [
    "M28,15 L28,58 C28,87 72,87 72,58 L72,15",
  ]),
  G("V", "V is for volcano! Kaboom!", ["M25,15 L50,85 L75,15"]),
  G("W", "W is for whale! Big splash!", [
    "M18,15 L34,85 L50,35 L66,85 L82,15",
  ]),
  G("X", "X marks the treasure! Ahoy!", ["M28,15 L72,85", "M72,15 L28,85"]),
  G("Y", "Y is for yo-yo! Up and down!", [
    "M28,15 L50,48",
    "M72,15 L50,48",
    "M50,48 L50,85",
  ]),
  G("Z", "Z is for zebra! Zzzz-tastic!", ["M28,15 L72,15 L28,85 L72,85"]),
];
