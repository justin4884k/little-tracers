"use client";

import { use } from "react";
import Link from "next/link";
import { ALL_GLYPHS, UPPER_DEFAULT_SHEET } from "@/data/worksheetSets";
import { GlyphPreview } from "@/components/ui/GlyphPreview";
import type { Glyph } from "@/engine/types";

/** Four practice repetitions per glyph: one solid model, three dotted traces. */
function WorksheetRow({ glyph }: { glyph: Glyph }) {
  return (
    <div className="print-row mb-6 border-b border-neutral-300 pb-4">
      <div className="mb-1 flex items-baseline gap-3">
        <span className="text-lg font-bold text-neutral-800">
          {glyph.display || glyph.spoken}
        </span>
        <span className="text-sm text-neutral-500">{glyph.phrase}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative h-28 w-28 shrink-0 rounded-lg border-2 border-neutral-300">
          <GlyphPreview glyph={glyph} color="#111827" strokeWidth={7} className="h-full w-full" />
          <span className="absolute bottom-0 right-1 text-[0.6rem] text-neutral-400">
            model
          </span>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 w-28 shrink-0 rounded-lg border-2 border-dashed border-neutral-300">
            <GlyphPreview
              glyph={glyph}
              color="#9ca3af"
              strokeWidth={7}
              dashed
              className="h-full w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WorksheetPage(props: {
  searchParams: Promise<{ glyphs?: string }>;
}) {
  const { glyphs } = use(props.searchParams);

  const selected: Glyph[] = glyphs
    ? glyphs
        .split(",")
        .map((id) => ALL_GLYPHS.find((g) => g.id === id))
        .filter((g): g is Glyph => Boolean(g))
    : UPPER_DEFAULT_SHEET;

  return (
    <div className="min-h-dvh w-full bg-white p-8 text-neutral-900">
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4 rounded-bubble bg-violet/10 p-5">
        <div>
          <h1 className="text-2xl font-extrabold">Tracing worksheet</h1>
          <p className="text-sm text-ink-soft">
            {selected.length} {selected.length === 1 ? "lesson" : "lessons"} · trace
            the dotted shapes, following the model on the left.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-bubble bg-violet px-6 py-3 font-bold text-white shadow-md"
            onClick={() => window.print()}
          >
            🖨️ Print
          </button>
          <Link
            href="/grown-ups"
            className="rounded-bubble bg-white px-6 py-3 font-bold text-ink shadow-md"
          >
            Back
          </Link>
        </div>
      </div>

      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-neutral-800 pb-2">
        <h2 className="text-xl font-extrabold">Little Tracers · Practice Sheet</h2>
        <span className="whitespace-nowrap text-sm text-neutral-500">
          Name: ____________________
        </span>
      </header>

      <main>
        {selected.map((g) => (
          <WorksheetRow key={g.id} glyph={g} />
        ))}
      </main>

      <footer className="mt-8 text-center text-xs text-neutral-400">
        Little Tracers — free handwriting practice. Celebrate effort, not perfection.
      </footer>
    </div>
  );
}
