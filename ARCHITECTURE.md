# Little Tracers — Architecture & Design

> A free, magical handwriting adventure for children ages 3–6.
> Not digital worksheets — an adventure where practice is play.

## 1. Product pillars

1. **Play first.** Every screen is a place, not a form. Lessons live inside worlds.
2. **Zero reading, zero friction.** No accounts. Voice guides everything. One tap to play.
3. **Never punish.** No fail states. Minimum 1 star for effort. Assistance adapts *toward* the child.
4. **Reward loops.** Practice → Reward → Explore → Unlock → Customize → Practice again.
5. **Grown-ups on the side.** Parent insights + teacher tools behind a gate, all data local.

## 2. Screens & navigation

| Route | Audience | Purpose |
|---|---|---|
| `/` | Child | Landing: mascot greeting, big Play button (first tap also unlocks audio/TTS) |
| `/map` | Child | World map — 5 floating islands, progress at a glance |
| `/world/[worldId]` | Child | Lesson trail: nodes along a winding path, stars, locked/next states |
| `/trace/[glyphId]` | Child | The tracing experience (demo → trace → celebrate) |
| `/treehouse` | Child | Rewards hub: pets, sticker book, treehouse decorating |
| `/grown-ups` | Adult | Gated: parent dashboard + teacher mode (missions, worksheets, reset) |
| `/print/worksheet` | Adult | Print-CSS worksheet generator |

Child navigation is icon+voice only. All buttons ≥ 64px touch targets.

## 3. Worlds & curriculum

| World | Content | Pedagogical order |
|---|---|---|
| Motor Skills Playground | 10 pre-writing strokes (lines, curves, zigzags, spirals) | First — ages 3+ |
| Alphabet Forest | Uppercase A–Z | Grouped by stroke family (L F E H T I …) |
| Rainbow Town | Lowercase a–z | After uppercase |
| Ocean Numbers | 0–9 | Parallel track |
| Space Shapes | 10 shapes | Parallel track |

Glyphs are **data, not code**: each glyph = ordered strokes, each stroke = an SVG path in a
normalized 100×100 space, plus spoken name and a fun phrase. Adding content = adding data.

## 4. Tracing engine (`src/engine`)

- **Sampler** (`svg-path-properties`): converts each stroke path into ordered checkpoints
  (~every 3 units of length). Pure, memoized.
- **Trace state machine** (`useTraceEngine`):
  - Phases: `demo → ready → tracing → strokeDone → celebrating`.
  - Pointer events (finger / Apple Pencil / mouse — all just pointer events) advance a
    checkpoint cursor when the pointer is within tolerance of upcoming checkpoints.
  - **Authoritative state lives in a ref**, not React state. Pointer events arrive far
    faster than React re-renders (a stylus fires ~120 Hz), so reading progress through a
    render closure goes stale and strokes complete out of order. React state is a render
    mirror only, and stroke completion is idempotent via a `completedStrokes` set.
  - **Magnetic ink**: the drawn ink renders *snapped to the guide path* up to current progress —
    the result always looks beautiful, which is itself a reward. A faint real trail shows honesty.
  - Straying pauses progress and triggers a gentle hint (mascot + sparkle at the next point) —
    never an error sound, never a reset.
  - **Contact is verified on every move** (`evt.buttons > 0`). A pointermove without contact
    ends the stroke instead of extending it. Without this an Apple Pencil hovering above the
    iPad — or a pointerdown that never got its pointerup, from capture loss, a tab switch, or
    palm rejection — would silently draw the whole letter for the child.
  - **Adaptive difficulty**: per-glyph tolerance widens after struggling attempts, narrows very
    slowly after 3-star runs. Stored with progress.
- **Scoring**: wander ratio + hints used → 1–3 stars. Floor = 1 star, always celebrated.
  A hint only counts against the score if it fires while the child is *actively tracing
  and stuck*. Taking a long time to begin, or pausing to look at the picture, is
  curiosity — the app must never quietly mark a child down for it.
- **Rendering**: react-konva canvas. Layers: guide (soft track + glowing dashed current stroke +
  numbered start badge + direction arrow) / ink (rainbow gradient) / fx (sparkle at tip).
- **Demo**: animated dot travels the stroke with a trailing reveal before the child's turn.

## 5. Reward engine (`src/engine/rewards.ts`)

- Stars are the currency (earned, never bought — nothing is monetized).
- Each lesson completion → stars + a **sticker** of the glyph.
- World milestones (25% / 50% / 100%) hatch **pets** (original characters per world).
- Treehouse **decorations** unlock with star spending.
- Reward engine is a pure function: `(progress) → entitlements`, so UI can't drift from truth.

## 6. State & persistence (`src/store`)

- Zustand stores with `persist` middleware backed by **IndexedDB** (`idb-keyval`).
- `progressStore`: per-glyph progress (stars, attempts, tolerance, ms practiced), daily practice
  log (for streaks/charts), unlocked pets/stickers/decorations, placed decorations, active pet.
- `settingsStore`: voice + sound toggles (the classroom controls), and the teacher-assigned
  mission (glyph ids), which surfaces as a “Today's mission” button on the child's map.
- Everything local. No network calls. Export/backup can come later.

## 7. Audio & voice (`src/lib`)

- `speech.ts`: Web Speech API wrapper — queued, cancellable, kid-friendly rate/pitch, best-voice
  picker. Every child-facing screen narrates itself.
- `sounds.ts`: WebAudio synth (no asset downloads): pop, sparkle arpeggio, stroke chime,
  success fanfare. Lazy AudioContext (unlocked by landing-page tap).

## 8. Design language

- **Palette**: soft sky gradients, cream `#FFF9F0` surfaces, joyful accents
  (sunshine `#FFC93C`, coral `#FF7B6B`, teal `#2DD4BF`, violet `#8B5CF6`, leaf `#4ADE80`).
- **Type**: Baloo 2 (rounded, warm) via `next/font` (self-hosted → offline-safe).
- **Shape**: everything rounded (radius 24–999), chunky 4px bottom borders for "pressable" depth.
- **Motion**: Framer Motion — springy taps, floating idle animations, staggered entrances,
  celebration bursts. Respects `prefers-reduced-motion`.
- **Mascot**: "Pip" — an original round golden firefly-spark with expressive eyes. States:
  happy / excited / cheering / encouraging. Appears everywhere, speaks on tap.
- **Accessibility**: 64px+ targets, ARIA labels everywhere, voice + icon redundancy, high
  contrast on text, reduced-motion support.

## 9. Technical stack

Next.js 16 (App Router) · TypeScript strict · Tailwind 4 (`@theme` tokens) · Framer Motion ·
react-konva (canvas tracing) · idb-keyval (IndexedDB) · zustand (state) ·
svg-path-properties (path math) · PWA (manifest + service worker, offline-first) · Vercel-ready.

Konva components are client-only via `dynamic(..., { ssr: false })`.

## 10. Phases

1. **Foundation**: theme, layout, lib (speech/sounds), glyph data, engine core.
2. **Tracing experience**: canvas, demo, magnetic ink, celebration.
3. **World & navigation**: landing, map, world trails, lesson flow, reward wiring.
4. **Rewards hub**: treehouse, pets, stickers, decorating.
5. **Grown-ups**: parent dashboard, teacher mode, worksheets, reset.
6. **PWA + polish**: manifest, service worker, offline, review/refactor pass, build verification.

## 11. Future expansion (designed-for, not built)

- Word tracing (CVC words) as World 6; cursive pack; multiple child profiles;
  audio-recorded phonics; export progress file for teachers; more locales (glyph data
  already locale-shaped); haptics on supporting devices.
- **Handedness setting** — mirror Pip and the hint placement for left-handed children so
  their drawing hand doesn't cover the mascot or the next checkpoint.
