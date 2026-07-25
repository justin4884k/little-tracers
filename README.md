# Little Tracers 🌈✏️

A **free** handwriting and tracing adventure for children ages 3–6.

Not digital worksheets — an adventure. Children trace letters, numbers and shapes across
five joyful worlds, collect animal friends, and decorate their own treehouse. No account,
no login, no reading required, nothing monetized, and every byte of progress stays on the
child's own device.

## The philosophy, enforced in code

- **Never punish.** There is no fail state anywhere in the app. Lifting a finger keeps your
  progress. Straying pauses it and brings a friendly nudge, never a buzzer.
- **Celebrate effort.** Every completed lesson earns at least one star, a sticker, and a
  cheer from Pip.
- **Curiosity over perfection.** Nothing is locked. The suggested next lesson pulses gently;
  any lesson can be tapped at any time.
- **Patience isn't penalized.** A hint only affects the star score if it arrives while the
  child is actively tracing and stuck. Taking a while to start is curiosity, not a mistake.
- **Adaptive, in the kind direction.** After a hard attempt the tracing path quietly widens;
  after a perfect one it narrows a little. Difficulty never changes mid-lesson.

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000.

To build for production:

```bash
npm run build
```

Deploys to Vercel with no configuration.

## What's inside

| Area | Route | Notes |
|---|---|---|
| Landing | `/` | One giant Play button; the first tap also unlocks audio/TTS |
| World map | `/map` | Five worlds + the treehouse, with progress at a glance |
| Lesson trail | `/world/[worldId]` | A winding trail of lesson bubbles |
| Tracing | `/trace/[glyphId]` | The core experience |
| Treehouse | `/treehouse` | Pets, sticker book, and decorating |
| Grown-ups | `/grown-ups` | Parent dashboard + teacher mode, behind a simple gate |
| Worksheets | `/print/worksheet` | Printable dotted tracing sheets |

**82 lessons** across five worlds: 10 pre-writing strokes (Motor Skills Playground),
A–Z (Alphabet Forest), a–z (Rainbow Town), 0–9 (Ocean Numbers), and 10 shapes (Space Shapes).

## Stack

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 4 · Framer Motion ·
react-konva · Zustand + IndexedDB · PWA with offline support.

Sound effects are synthesized with the Web Audio API and narration uses the Web Speech API,
so the app ships **no audio assets** and works fully offline.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design: the tracing engine, the reward
engine, persistence, and planned expansion.

## Privacy

Little Tracers makes **no network requests**. There is no analytics, no account, no
telemetry, and no advertising. All progress lives in IndexedDB on the device and can be
erased at any time from Teacher mode → Reset progress.
