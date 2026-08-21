"use client";

import { useEffect, useState, useTransition } from "react";
import { PilotStatus, PilotTaskStatus } from "@prisma/client";
import {
  createPilotProducer,
  updatePilotStatus,
  updateTaskStatus,
} from "./actions";
import {
  STATUS_META,
  TASK_STATUS_META,
  PHASE_LABELS,
} from "./pilot-constants";
import type { PilotCategoryRow } from "./pilot-category-manager";
import type { RoadmapMonth, RoadmapStep } from "./pilot-roadmap";

// ---------------------------------------------------------------------------
// Types (replicated from Prisma to avoid deep import issues in client)
// ---------------------------------------------------------------------------

type Task = {
  id: string;
  phase: number;
  title: string;
  description: string | null;
  status: PilotTaskStatus;
  assignedTo: string | null;
  dueDate: Date | null;
  completedAt: Date | null;
};

type Producer = {
  id: string;
  producerName: string;
  category: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  status: PilotStatus;
  commissionPct: number;
  founderDiscount: boolean;
  notes: string | null;
  visitDate: Date | null;
  onboardedAt: Date | null;
  vendor: { id: string; tradeName: string; slug: string } | null;
  tasks: Task[];
};

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: PilotStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Task row
// ---------------------------------------------------------------------------

function TaskRow({ task }: { task: Task }) {
  const [, startTransition] = useTransition();
  const meta = TASK_STATUS_META[task.status];

  const nextStatus: Record<PilotTaskStatus, PilotTaskStatus> = {
    PENDING: "IN_PROGRESS",
    IN_PROGRESS: "DONE",
    DONE: "PENDING",
    BLOCKED: "IN_PROGRESS",
  };

  return (
    <li className="flex items-start gap-3 py-2">
      <button
        onClick={() => startTransition(() => updateTaskStatus(task.id, nextStatus[task.status]))}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.status === "DONE"
            ? "border-emerald-500 bg-emerald-500 text-white"
            : task.status === "IN_PROGRESS"
            ? "border-amber-400 bg-amber-50"
            : task.status === "BLOCKED"
            ? "border-red-400 bg-red-50"
            : "border-stone-300 bg-white"
        }`}
        title={`Cambiar a: ${TASK_STATUS_META[nextStatus[task.status]].label}`}
      >
        {task.status === "DONE" ? (
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : task.status === "IN_PROGRESS" ? (
          <span className="h-2 w-2 rounded-full bg-amber-400" />
        ) : task.status === "BLOCKED" ? (
          <span className="h-2 w-2 rounded-full bg-red-400" />
        ) : null}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${task.status === "DONE" ? "line-through text-stone-400" : "text-stone-700"}`}>
          {task.title}
        </p>
        {task.assignedTo ? (
          <p className="text-xs text-stone-400">{task.assignedTo}</p>
        ) : null}
      </div>
      <span className={`shrink-0 text-xs font-medium ${meta.color}`}>{meta.label}</span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Phase section
// ---------------------------------------------------------------------------

function PhaseSection({
  phase,
  tasks,
  highlighted = false,
}: {
  phase: number;
  tasks: Task[];
  highlighted?: boolean;
}) {
  const meta = PHASE_LABELS[phase];
  const done = tasks.filter((t) => t.status === "DONE").length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div
      className={`rounded-2xl border p-4 ${meta.color} ${
        highlighted ? "ring-2 ring-emerald-500 ring-offset-2" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {meta.month}
          </span>
          <p className="text-sm font-medium text-stone-800">{meta.label}</p>
        </div>
        <span className="text-xs font-semibold text-stone-500">
          {done}/{tasks.length}
        </span>
      </div>
      <div className="mb-3 h-1.5 rounded-full bg-white/60">
        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <ul className="divide-y divide-white/50">
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Producer card
// ---------------------------------------------------------------------------

function ProducerCard({
  producer,
  categories,
  focusPhase = null,
  forceOpen = false,
}: {
  producer: Producer;
  categories: PilotCategoryRow[];
  focusPhase?: 1 | 2 | 3 | null;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(forceOpen);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen, focusPhase]);

  const tasksByPhase: Record<number, Task[]> = { 1: [], 2: [], 3: [] };
  for (const t of producer.tasks) {
    (tasksByPhase[t.phase] ??= []).push(t);
  }

  const totalTasks = producer.tasks.length;
  const doneTasks = producer.tasks.filter((t) => t.status === "DONE").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const phaseTasks =
    focusPhase != null
      ? (tasksByPhase[focusPhase] ?? [])
      : [];
  const phaseDone = phaseTasks.filter((t) => t.status === "DONE").length;

  const statusOrder: PilotStatus[] = [
    "IDENTIFIED", "CONTACTED", "NEGOTIATING", "ONBOARDED", "BETA_TESTING", "ACTIVE", "DECLINED",
  ];

  return (
    <div
      className={`rounded-3xl border bg-white overflow-hidden ${
        forceOpen ? "border-emerald-400 shadow-sm" : "border-stone-200"
      }`}
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-start gap-4 p-5 hover:bg-stone-50"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-lg select-none">
          {categoryIcon(producer.category, categories)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-stone-800">{producer.producerName}</p>
            <StatusBadge status={producer.status} />
            {producer.founderDiscount && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Fundador 12%
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-stone-500">
            {producer.category}
            {producer.location ? ` · ${producer.location}` : ""}
          </p>
          {focusPhase != null && phaseTasks.length > 0 ? (
            <p className="mt-1 text-xs font-medium text-emerald-800">
              Fase {focusPhase}: {phaseDone}/{phaseTasks.length} tareas hechas
            </p>
          ) : null}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-stone-100">
              <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-stone-400">{doneTasks}/{totalTasks} tareas</span>
          </div>
        </div>
        <span className="text-stone-400 text-sm select-none">{open ? "▲" : "▼"}</span>
      </div>

      {/* Expanded */}
      {open && (
        <div className="border-t border-stone-100 p-5 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            {[
              ["Contacto", producer.contactPerson],
              ["Teléfono", producer.phone],
              ["Email", producer.email],
              ["Ubicación", producer.location],
              ["Visita realizada", producer.visitDate ? new Date(producer.visitDate).toLocaleDateString("es-ES") : null],
              ["Onboarding", producer.onboardedAt ? new Date(producer.onboardedAt).toLocaleDateString("es-ES") : null],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k as string}>
                  <span className="text-stone-400">{k}: </span>
                  <span className="text-stone-700">{v}</span>
                </div>
              ))}
            {producer.vendor ? (
              <div>
                <span className="text-stone-400">Cuenta activa: </span>
                <a href={`/admin/productores/${producer.vendor.id}`} className="text-emerald-700 underline">
                  {producer.vendor.tradeName}
                </a>
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500 mb-2">Cambiar estado</p>
            <div className="flex flex-wrap gap-2">
              {statusOrder.map((s) => (
                <button
                  key={s}
                  onClick={() => startTransition(() => updatePilotStatus(producer.id, s))}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    producer.status === s
                      ? STATUS_META[s].color + " ring-2 ring-offset-1 ring-emerald-400"
                      : "border-stone-200 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </div>

          {producer.notes ? (
            <div className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-600 italic">
              {producer.notes}
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Tareas por fase
            </p>
            {[1, 2, 3].map((phase) =>
              tasksByPhase[phase]?.length ? (
                <PhaseSection
                  key={phase}
                  phase={phase}
                  tasks={tasksByPhase[phase]}
                  highlighted={focusPhase === phase}
                />
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  Miel: "🍯",
  "Embutidos de Caza": "🦌",
  "Queso de Autor": "🧀",
  "Vinos y Licores": "🍷",
  "Conservas y Mermeladas": "🫙",
  "Repostería artesana": "🥖",
  "Aceites y condimentos": "🫒",
  "Restaurantes y mesones": "🍽️",
  "Casas rurales": "🏡",
  "Hoteles y alojamientos": "🏨",
  "Bares y tapas": "🍺",
  "Catering y eventos": "🎉",
  "Turismo activo / experiencias": "🥾",
};

function categoryIcon(name: string, categories: PilotCategoryRow[]): string {
  const fromDb = categories.find((c) => c.name === name)?.icon;
  return fromDb || CATEGORY_ICONS[name] || "🌿";
}

// ---------------------------------------------------------------------------
// New producer form
// ---------------------------------------------------------------------------

function NewProducerForm({
  onClose,
  categories,
}: {
  onClose: () => void;
  categories: PilotCategoryRow[];
}) {
  const [pending, startTransition] = useTransition();
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          await createPilotProducer(fd);
          onClose();
        });
      }}
      className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-6"
    >
      <p className="font-semibold text-emerald-900">Añadir productor piloto</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Nombre comercial *</label>
          <input name="producerName" required className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Categoría *</label>
          <select name="category" required className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
            {activeCategories.length === 0 ? (
              <option value="">Sin categorías activas</option>
            ) : (
              activeCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon ? `${c.icon} ` : ""}
                  {c.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Persona de contacto</label>
          <input name="contactPerson" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Teléfono</label>
          <input name="phone" type="tel" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
          <input name="email" type="email" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Municipio</label>
          <input name="location" className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-stone-600 mb-1">Notas iniciales</label>
          <textarea name="notes" rows={2} className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary"
        >
          {pending ? "Guardando…" : "Crear productor piloto"}
        </button>
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main board
// ---------------------------------------------------------------------------

export function PilotBoard({
  producers,
  categories,
  focusMonth = null,
  focusStep = null,
}: {
  producers: Producer[];
  categories: PilotCategoryRow[];
  focusMonth?: RoadmapMonth | null;
  focusStep?: RoadmapStep | null;
}) {
  const [showForm, setShowForm] = useState(false);

  const activeCategoryNames = categories.filter((c) => c.isActive).map((c) => c.name);
  const coveredCategories = new Set(
    producers.filter((p) => p.status !== "DECLINED").map((p) => p.category),
  );
  const missingCategories = activeCategoryNames.filter((c) => !coveredCategories.has(c));

  const active = producers.filter((p) => p.status !== "DECLINED");
  const declined = producers.filter((p) => p.status === "DECLINED");

  const filteredActive =
    focusStep?.statusFilter && focusStep.statusFilter.length > 0
      ? active.filter((p) => focusStep.statusFilter!.includes(p.status))
      : active;

  const focusPhase = focusStep?.taskPhase ?? null;

  return (
    <div className="space-y-6">
      {/* Alerta de categorías sin cubrir */}
      {missingCategories.length > 0 && !focusMonth ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm">
          <p className="font-medium text-amber-800">Categorías activas sin productor asignado:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missingCategories.map((c) => (
              <span key={c} className="rounded-full bg-amber-100 border border-amber-200 px-3 py-0.5 text-xs font-medium text-amber-700">
                {categoryIcon(c, categories)} {c}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Controles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          {focusMonth
            ? `${filteredActive.length} productor${filteredActive.length !== 1 ? "es" : ""} en Mes ${focusMonth}`
            : `${active.length} productor${active.length !== 1 ? "es" : ""} en seguimiento`}
          {!focusMonth && declined.length > 0
            ? ` · ${declined.length} declinado${declined.length !== 1 ? "s" : ""}`
            : ""}
        </p>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary text-sm">
            + Añadir productor
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <NewProducerForm onClose={() => setShowForm(false)} categories={categories} />
      )}

      {/* Tarjetas activas */}
      {filteredActive.length === 0 && !showForm ? (
        <div className="rounded-3xl border border-dashed border-stone-300 p-10 text-center text-stone-400">
          <p className="text-4xl mb-3">{focusMonth ? "🔍" : "🌱"}</p>
          <p className="font-medium">
            {focusMonth
              ? `Nadie está en el estado de Mes ${focusMonth} todavía.`
              : "Aún no hay productores piloto registrados."}
          </p>
          <p className="text-sm mt-1">
            {focusMonth
              ? "Cambia el estado de un productor o quita el filtro de la hoja de ruta."
              : "Añade los candidatos del catálogo de lanzamiento."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredActive.map((p) => (
            <ProducerCard
              key={p.id}
              producer={p}
              categories={categories}
              focusPhase={focusPhase}
              forceOpen={Boolean(focusMonth)}
            />
          ))}
        </div>
      )}

      {/* Declinados (colapsados) — solo sin filtro de mes */}
      {!focusMonth && declined.length > 0 && (
        <details className="rounded-2xl border border-stone-200">
          <summary className="cursor-pointer px-5 py-3 text-sm text-stone-500 hover:bg-stone-50">
            {declined.length} productor{declined.length !== 1 ? "es" : ""} declinado{declined.length !== 1 ? "s" : ""}
          </summary>
          <div className="grid gap-3 p-4 lg:grid-cols-2">
            {declined.map((p) => (
              <ProducerCard key={p.id} producer={p} categories={categories} />
            ))}
          </div>
        </details>
      )}

      {/* Leyenda de fases */}
      <div className="rounded-3xl border border-stone-100 bg-stone-50 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
          Referencia — Checklist de cada fase
        </p>
        <div className="grid gap-4 sm:grid-cols-3 text-xs text-stone-600">
          <div
            className={`rounded-2xl p-3 ${
              focusPhase === 1 ? "bg-amber-100 ring-2 ring-amber-400" : ""
            }`}
          >
            <p className="font-semibold text-amber-700 mb-1">Fase 1 (Mes 2) · Selección</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Investigar empresa y catálogo</li>
              <li>Preparar ficha de propuesta</li>
              <li>Verificar no-perecederos</li>
            </ul>
          </div>
          <div
            className={`rounded-2xl p-3 ${
              focusPhase === 2 ? "bg-blue-100 ring-2 ring-blue-400" : ""
            }`}
          >
            <p className="font-semibold text-blue-700 mb-1">Fase 2 (Mes 3–4) · Captación / onboarding</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Visita presencial</li>
              <li>Oferta Fundadores 12%</li>
              <li>Fotografía + fichas IA</li>
              <li>Firma contrato + Stripe</li>
              <li>Depósito stock trastienda</li>
            </ul>
          </div>
          <div
            className={`rounded-2xl p-3 ${
              focusPhase === 3 ? "bg-violet-100 ring-2 ring-violet-400" : ""
            }`}
          >
            <p className="font-semibold text-violet-700 mb-1">Fase 3 (Mes 5) · Beta</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Pedidos simulados (Bizum + tarjeta)</li>
              <li>Verificar SMS/email artesano</li>
              <li>Auditar entrega 24/48h (demanda nacional)</li>
              <li>Validar split 12%/88% Stripe</li>
              <li>Recoger testimonio marketing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
