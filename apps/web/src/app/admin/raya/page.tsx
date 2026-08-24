import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = { title: "La Raya Línea 1 | Admin" };

const KEY_RULES: Array<[string, string]> = [
  ["Vía", "Línea 1 — complemento ICECYL creación empresas"],
  [
    "Intensidad total",
    "Hasta 74 % de costes subvencionables (ICECYL 35/40/45 % en Zamora + resto Diputación)",
  ],
  ["Tope ayuda Diputación L1", "300.000 €"],
  [
    "Escenario interno",
    "30.000 € elegibles → ~40 % ICECYL + ~34 % Dip. = 74 % (22.200 €)",
  ],
  ["Plazo gastos", "1 jun 2025 – 30 abr 2027"],
  ["Plazo solicitud", "Hasta 31 dic 2026 (orden de presentación; crédito limitado)"],
  ["Territorio", "Villardeciervos = municipio nº 64 del anexo"],
  ["Trámite jurídico", "Solo sede electrónica, código 4447"],
  [
    "Justificación L1",
    "Vía ICECYL: copia solicitud de pago ICECYL; Diputación espera informe ICECYL",
  ],
];

type DocTone = "danger" | "warning" | "neutral" | "ok";

const DOCS_L1: Array<{
  letter: string;
  doc: string;
  have: string;
  note: string;
  tone: DocTone;
}> = [
  {
    letter: "a",
    doc: "DNI firmante + CIF + escritura/estatutos inscritos",
    have: "Sí",
    note: "Disponible (DNI/CIF y escritura/estatutos inscritos)",
    tone: "danger",
  },
  {
    letter: "b",
    doc: "Apoderamiento apud acta (Modelo 4420 0010) si hay representante",
    have: "Sí",
    note: "Apoderamiento apud acta (4420 0010) preparado (si aplica)",
    tone: "neutral",
  },
  {
    letter: "c",
    doc: "Alta SS autónomo / o compromiso si próxima creación",
    have: "No",
    note: "Previsto Socio 2 RETA; falta formalizar",
    tone: "warning",
  },
  {
    letter: "d",
    doc: "Declaración minimis (3 años + vinculadas)",
    have: "No",
    note: "Redactar/firmar al solicitar",
    tone: "warning",
  },
  {
    letter: "e",
    doc: "Memoria Técnica Modelo 4447 1001 (inversión + ubicación)",
    have: "Parcial",
    note: "Hay Memoria de Proyecto; falta volcar al modelo oficial",
    tone: "warning",
  },
  {
    letter: "f",
    doc: "Resolución de concesión ICECYL (BDNS 820240 u otra posterior)",
    have: "No",
    note: "Bloqueante: sin esto no hay Línea 1",
    tone: "danger",
  },
  {
    letter: "g",
    doc: "Autorización AEAT/TGSS o certificados al corriente + alta IAE",
    have: "No",
    note: "Tras constituir / alta censal",
    tone: "danger",
  },
  {
    letter: "h",
    doc: "Ficha de Terceros 4432 0100 + titularidad de cuenta",
    have: "No",
    note: "Cuenta a nombre de la beneficiaria",
    tone: "warning",
  },
  {
    letter: "i",
    doc: "Compromiso alta IAE/SS (empresa de próxima creación)",
    have: "No",
    note: "Alternativa si aún no está de alta en el censo",
    tone: "warning",
  },
];

const TONE_PILL: Record<DocTone, string> = {
  danger: "bg-red-50 text-red-800 border-red-200",
  warning: "bg-amber-50 text-amber-900 border-amber-200",
  neutral: "bg-stone-100 text-stone-700 border-stone-200",
  ok: "bg-emerald-50 text-emerald-900 border-emerald-200",
};

const STEPS = [
  "Constituir S.L. (CIF, estatutos, CNAE 62.01, domicilio Villardeciervos)",
  "Solicitar ICECYL creación empresas (efecto incentivador: no gastar elegible antes si lo exigen sus bases)",
  "Obtener Resolución de concesión ICECYL",
  "Rellenar Modelo 4447 1001 + anexos L1 y presentar Diputación (trámite 4447)",
  "Ejecutar y justificar primero ante ICECYL; Diputación liquida con informe ICECYL",
];

export default async function AdminRayaChecklistPage() {
  await requireAdmin();

  return (
    <AdminShell title="La Raya — Línea 1">
      <section className="rounded-[1.75rem] border border-red-900/15 bg-red-950 px-6 py-8 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-200">
          Diputación · bases consolidadas · trámite 4447
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Checklist de solicitud (no justificativa)
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-red-50/90">
          Sigue sin poder presentarse la solicitud de Diputación Línea 1. El texto
          consolidado exige la <strong className="font-medium">Resolución de
          concesión ICECYL</strong>. Sin S.L. ni concesión, el expediente está
          incompleto.
        </p>
        <p className="mt-4 text-sm text-red-100/80">
          Documento:{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
            docs/Checklist_Convocatoria_La_Raya_Linea1.md
          </code>
        </p>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-800">Tope intensidad L1</p>
          <p className="mt-1 text-3xl font-semibold text-emerald-950">74 %</p>
        </div>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-800">Docs L1 listos</p>
          <p className="mt-1 text-3xl font-semibold text-red-950">1 / 9</p>
          <p className="mt-1 text-xs text-red-700">Solo memoria parcial</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-800">Fin plazo solicitud</p>
          <p className="mt-1 text-3xl font-semibold text-amber-950">31/12/2026</p>
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="text-lg font-semibold">Reglas clave</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="pb-2 pr-4 font-medium">Concepto</th>
                <th className="pb-2 font-medium">Contenido</th>
              </tr>
            </thead>
            <tbody>
              {KEY_RULES.map(([k, v]) => (
                <tr key={k} className="border-b border-stone-100 last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-stone-800">{k}</td>
                  <td className="py-2.5 text-stone-600">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h3 className="text-lg font-semibold">Base Octava — documentación de solicitud</h3>
        <p className="mt-1 text-sm text-stone-500">
          Anexos a–i. No confundir con la justificación posterior.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="pb-2 pr-3 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">Documento</th>
                <th className="pb-2 pr-4 font-medium">Estado</th>
                <th className="pb-2 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody>
              {DOCS_L1.map((row) => (
                <tr key={row.letter} className="border-b border-stone-100 last:border-0 align-top">
                  <td className="py-3 pr-3 font-semibold text-stone-400">{row.letter}</td>
                  <td className="py-3 pr-4 text-stone-800">{row.doc}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_PILL[row.tone]}`}
                    >
                      {row.have}
                    </span>
                  </td>
                  <td className="py-3 text-stone-600">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold">Lo que el repo sí aporta</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>Memoria de proyecto (base para 4447 1001)</li>
            <li>Presupuesto elegible 30.000 € alineado al 74 %</li>
            <li>Plan viabilidad, caja, contingencia</li>
            <li>Evidencia tecnológica (marketplace)</li>
            <li>Villardeciervos confirmado en anexo</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/admin/plan"
              className="inline-flex min-h-9 items-center rounded-full border border-stone-300 px-3 text-xs font-medium hover:border-emerald-700"
            >
              Plan / simulación
            </Link>
            <Link
              href="/admin/entregables-ai"
              className="inline-flex min-h-9 items-center rounded-full border border-stone-300 px-3 text-xs font-medium hover:border-emerald-700"
            >
              Entregables A.I
            </Link>
          </div>
        </article>
        <article className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
          <h3 className="font-semibold">Secuencia correcta</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-stone-600">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </div>

      <p className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        Próximo documento crítico: no más implementación de software, sino{" "}
        <strong className="font-medium">(1) escritura S.L.</strong> y{" "}
        <strong className="font-medium">(2) expediente ICECYL</strong>. Después
        adaptar la Memoria de Proyecto al Modelo 4447 1001 y reunir anexos a–i.
      </p>
    </AdminShell>
  );
}
