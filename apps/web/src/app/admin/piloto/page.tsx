import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@culebra/db";
import { PilotCategoryManager } from "./pilot-category-manager";
import { PilotWorkspace } from "./pilot-workspace";

export const metadata = { title: "Grupo Piloto | Admin" };

async function getPilotData() {
  const [producers, categories] = await Promise.all([
    prisma.pilotProducer.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        tasks: { orderBy: [{ phase: "asc" }, { createdAt: "asc" }] },
        vendor: { select: { id: true, tradeName: true, slug: true } },
      },
    }),
    prisma.pilotCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);
  return { producers, categories };
}

export default async function AdminPilotoPage() {
  await requireAdmin();
  const { producers, categories } = await getPilotData();

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
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-stone-50 p-6">
          <p className="text-sm font-medium text-emerald-700">Programa de productores fundadores</p>
          <p className="mt-2 text-stone-600 text-sm leading-relaxed max-w-3xl">
            5 artesanos piloto de Zamora validarán la pasarela de pagos (Stripe Connect + Bizum),
            el flujo logístico hacia demanda nacional y servirán de &quot;efecto llamada&quot; para captar los
            siguientes 20–30 artesanos de La Raya en la campaña de invierno.
            Condiciones fundadores: <strong>12% de comisión el primer año</strong> (vs. 17% estándar).
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

        <PilotCategoryManager categories={categories} />

        <PilotWorkspace
          producers={producers.map((p) => ({
            ...p,
            commissionPct: Number(p.commissionPct),
          }))}
          categories={categories}
        />
      </div>
    </AdminShell>
  );
}
