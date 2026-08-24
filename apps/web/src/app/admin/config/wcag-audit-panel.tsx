"use client";

import { useActionState } from "react";
import { runWcagAuditAction, type WcagAuditState } from "./actions";

const initial: WcagAuditState = {};

export function WcagAuditPanel() {
  const [state, action, pending] = useActionState(runWcagAuditAction, initial);

  return (
    <section className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold">Pautas WAI / WCAG 2.2</h2>
        <p className="mt-1 text-sm text-stone-600">
          Comprueba páginas públicas: idioma, texto alternativo de imágenes y nombre accesible
          de enlaces y botones (criterios 1.1.1, 2.4.4, 3.1.1 y 4.1.2).
        </p>
      </div>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Auditando…" : "Auditar páginas públicas"}
        </button>
      </form>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state.reports ? (
        <ul className="space-y-3">
          {state.reports.map((report) => (
            <li
              key={report.path}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                report.ok ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
              }`}
            >
              <p className="font-medium">
                {report.path} · {report.ok ? "Cumple lo comprobado" : `${report.issues.length} aviso(s)`}
              </p>
              <p className="text-xs text-stone-500">
                {report.counts.images} img · {report.counts.links} enlaces · {report.counts.buttons} botones
              </p>
              {report.issues.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                  {report.issues.slice(0, 8).map((issue, idx) => (
                    <li key={`${issue.criterion}-${idx}`}>
                      <strong>{issue.criterion}:</strong> {issue.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
