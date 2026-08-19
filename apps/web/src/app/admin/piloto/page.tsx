import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@culebra/db";
import { PilotStatus, PilotTaskStatus } from "@prisma/client";
import { PilotBoard } from "./pilot-board";

export const metadata = { title: "Grupo Piloto | Admin" };

// ---------------------------------------------------------------------------
// Categorías sugeridas del plan de lanzamiento
// ---------------------------------------------------------------------------
export const PILOT_CATEGORIES = [
  "Miel",
  "Embutidos de Caza",
  "Queso de Autor",
  "Vinos y Licores",
  "Conservas y Mermeladas",
];

// ---------------------------------------------------------------------------
// Etiquetas de estado
// ---------------------------------------------------------------------------
export const STATUS_META: Record<PilotStatus, { label: string; color: string; dot: string }> = {
  IDENTIFIED: { label: "Identificado", color: "bg-stone-100 text-stone-700 border-stone-200", dot: "bg-stone-400" },
  CONTACTED: { label: "Contactado", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  NEGOTIATING: { label: "Negociando", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  ONBOARDED: { label: "Onboarding", color: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  BETA_TESTING: { label: "Beta Test", color: "bg-cyan-100 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
  ACTIVE: { label: "Activo", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  DECLINED: { label: "Declinado", color: "bg-red-100 text-red-600 border-red-200", dot: "bg-red-400" },
};

export const TASK_STATUS_META: Record<PilotTaskStatus, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "text-stone-400" },
  IN_PROGRESS: { label: "En curso", color: "text-amber-600" },
  DONE: { label: "Hecho", color: "text-emerald-600" },
  BLOCKED: { label: "Bloqueado", color: "text-red-600" },
};

export const PHASE_LABELS: Record<number, { label: string; month: string; color: string }> = {
  1: { label: "Fase 1 — Selección catálogo gourmet", month: "Mes 2", color: "bg-amber-50 border-amber-200" },
  2: { label: "Fase 2 — Captación puerta a puerta", month: "Mes 3", color: "bg-blue-50 border-blue-200" },
  3: { label: "Fase 3 — Ensayo general (Beta)", month: "Mes 5", color: "bg-violet-50 border-violet-200" },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

async function getPilotData() {
  const producers = await prisma.pilotProducer.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      tasks: { orderBy: [{ phase: "asc" }, { createdAt: "asc" }] },
      vendor: { select: { id: true, tradeName: true, slug: true } },
    },
  });
  return producers;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminPilotoPage() {
  await requireAdmin();
  const producers = await getPilotData();

  const activeCount = producers.filter((p) => p.status === "ACTIVE").length;
  const onboardedCount = producers.filter((p) =>
    ["ONBOARDED", "BETA_TESTING", "ACTIVE"].includes(p.status),
  ).length;
  const totalTasks = producers.flatMap((p) => p.tasks).length;
  const doneTasks = producers.flatMap((p) => p.tasks).filter((t) => t.status === "DONE").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <AdminShell title="Grupo Piloto — Lanzamiento Mes 6">
      <div className="space-y-8">
        {/* ---------- Cabecera del programa ---------- */}
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-stone-50 p-6">
          <p className="text-sm font-medium text-emerald-700">Programa de productores fundadores</p>
          <p className="mt-2 text-stone-600 text-sm leading-relaxed max-w-3xl">
            5 artesanos piloto de Zamora validarán la pasarela de pagos (Stripe Connect + Bizum),
            el flujo logístico hacia Madrid y servirán de "efecto llamada" para captar los
            siguientes 20–30 artesanos de La Raya en la campaña de invierno.
            Condiciones fundadores: <strong>10% de comisión el primer año</strong> (vs. 15% estándar).
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Productores objetivo", value: "5" },
              { label: "Onboarded / activos", value: `${onboardedCount} / ${activeCount}` },
              { label: "Tareas completadas", value: `${doneTasks} / ${totalTasks}` },
              { label: "Progreso global", value: `${progress}%` },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border border-stone-200 bg-white p-4 text-center">
                <p className="text-2xl font-semibold text-emerald-800">{kpi.value}</p>
                <p className="mt-1 text-xs text-stone-500">{kpi.label}</p>
              </div>
            ))}
          </div>
          {/* Barra de progreso global */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-stone-500 mb-1">
              <span>Progreso total del programa</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-stone-200">
              <div
                className="h-2.5 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ---------- Hoja de ruta de fases ---------- */}
        <div>
          <h2 className="text-base font-semibold mb-3">Hoja de ruta del programa (Meses 2–6)</h2>
          <ol className="flex flex-wrap gap-2 text-sm">
            {[
              { month: "Mes 2", label: "Selección catálogo gourmet", icon: "🛒" },
              { month: "Mes 3", label: "Captación puerta a puerta", icon: "🤝" },
              { month: "Mes 4", label: "Onboarding + fotografía", icon: "📸" },
              { month: "Mes 5", label: "Ensayo general (Beta)", icon: "🧪" },
              { month: "Mes 6", label: "Lanzamiento público", icon: "🚀" },
            ].map((step) => (
              <li
                key={step.month}
                className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2"
              >
                <span>{step.icon}</span>
                <span>
                  <span className="font-medium text-emerald-800">{step.month}</span>
                  <span className="text-stone-500"> · {step.label}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* ---------- Tablero interactivo (Client Component) ---------- */}
        <PilotBoard producers={producers as Parameters<typeof PilotBoard>[0]["producers"]} />
      </div>
    </AdminShell>
  );
}
