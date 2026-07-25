"use client";

import { useState } from "react";
import Link from "next/link";
import { AdultGate } from "@/components/grownups/AdultGate";
import { ParentDashboard } from "@/components/grownups/ParentDashboard";
import { TeacherMode } from "@/components/grownups/TeacherMode";

type View = "parent" | "teacher";

export default function GrownUpsPage() {
  const [view, setView] = useState<View>("parent");

  return (
    <AdultGate>
      <div className="min-h-dvh w-full bg-gradient-to-b from-[#eef2ff] to-[#faf5ff] pb-16">
        <header className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h1 className="text-3xl font-extrabold text-ink">Little Tracers</h1>
            <p className="text-base text-ink-soft">Grown-ups area</p>
          </div>
          <Link
            href="/"
            className="rounded-bubble bg-leaf px-6 py-3 font-bold text-white shadow-md"
          >
            ▶️ Back to the app
          </Link>
        </header>

        <nav className="mx-auto mb-6 flex max-w-4xl gap-3 px-6">
          {(["parent", "teacher"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              className={`min-h-12 rounded-bubble px-6 py-3 font-bold shadow-sm ${
                view === v ? "bg-violet text-white" : "bg-white text-ink-soft"
              }`}
              onClick={() => setView(v)}
            >
              {v === "parent" ? "👨‍👩‍👧 Parent dashboard" : "🍎 Teacher mode"}
            </button>
          ))}
        </nav>

        <main className="mx-auto max-w-4xl px-6">
          {view === "parent" ? <ParentDashboard /> : <TeacherMode />}
        </main>
      </div>
    </AdultGate>
  );
}
