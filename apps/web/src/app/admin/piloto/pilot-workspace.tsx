"use client";

import { useMemo, useState } from "react";
import { PilotBoard } from "./pilot-board";
import type { PilotCategoryRow } from "./pilot-category-manager";
import { ROADMAP_STEPS, type RoadmapMonth } from "./pilot-roadmap";

type ProducerForBoard = Parameters<typeof PilotBoard>[0]["producers"][number];

type PilotWorkspaceProps = {
  producers: ProducerForBoard[];
  categories: PilotCategoryRow[];
};

export function PilotWorkspace({ producers, categories }: PilotWorkspaceProps) {
  const [selectedMonth, setSelectedMonth] = useState<RoadmapMonth | null>(null);

  const step = useMemo(
    () => ROADMAP_STEPS.find((s) => s.month === selectedMonth) ?? null,
    [selectedMonth],
  );

  function toggleMonth(month: RoadmapMonth) {
    setSelectedMonth((prev) => (prev === month ? null : month));
    requestAnimationFrame(() => {
      document.getElementById("tablero-piloto")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold mb-1">
          Hoja de ruta del programa (Meses 2–6)
        </h2>
        <p className="mb-3 text-sm text-stone-500">
          Pulsa un mes para filtrar el tablero y centrarte en esa fase. Vuelve a
          pulsar para quitar el filtro.
        </p>
        <ol className="flex flex-wrap gap-2 text-sm">
          {ROADMAP_STEPS.map((item) => {
            const active = selectedMonth === item.month;
            return (
              <li key={item.month}>
                <button
                  type="button"
                  onClick={() => toggleMonth(item.month)}
                  aria-pressed={active}
                  title={item.description}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 transition ${
                    active
                      ? "border-emerald-700 bg-emerald-800 text-white shadow-sm"
                      : "border-stone-200 bg-white hover:border-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  <span aria-hidden>{item.icon}</span>
                  <span>
                    <span
                      className={`font-medium ${active ? "text-white" : "text-emerald-800"}`}
                    >
                      Mes {item.month}
                    </span>
                    <span className={active ? "text-emerald-100" : "text-stone-500"}>
                      {" "}
                      · {item.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {step ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            <p className="font-medium">
              Vista: Mes {step.month} — {step.label}
            </p>
            <p className="mt-1 text-emerald-900/80">{step.description}</p>
            <button
              type="button"
              onClick={() => setSelectedMonth(null)}
              className="mt-2 text-xs font-medium text-emerald-800 underline"
            >
              Quitar filtro y ver todos
            </button>
          </div>
        ) : null}
      </div>

      <div id="tablero-piloto">
        <PilotBoard
          producers={producers}
          categories={categories}
          focusMonth={selectedMonth}
          focusStep={step}
        />
      </div>
    </div>
  );
}
