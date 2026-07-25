import type { Glyph } from "@/engine/types";
import { ALL_GLYPHS } from "./worlds";
import { UPPERCASE_GLYPHS } from "./glyphs/uppercase";

export { ALL_GLYPHS };

/** Default printable sheet when a teacher hasn't assigned a mission. */
export const UPPER_DEFAULT_SHEET: Glyph[] = UPPERCASE_GLYPHS.slice(0, 8);
