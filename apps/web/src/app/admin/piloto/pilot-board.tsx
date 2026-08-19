"use client";

import { useState, useTransition } from "react";
import { PilotStatus, PilotTaskStatus } from "@prisma/client";
import {
  createPilotProducer,
  updatePilotStatus,
  updateTaskStatus,
} from "./actions";
import {
  PILOT_CATEGORIES,
  STATUS_META,
  TASK_STATUS_META,
  PHASE_LABELS,
} from "./page";

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
  commissionPct: unknown; // Decimal
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

function PhaseSection({ phase, tasks }: { phase: number; tasks: Task[] }) {
  const meta = PHASE_LABELS[phase];
  const done = tasks.filter((t) => t.status === "DONE").length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className={`rounded-2xl border p-4 ${meta.color}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{meta.month}</span>
          <p className="text-sm font-medium text-stone-800">{meta.label}</p>
        </div>
        <span className="text-xs font-semibold text-stone-500">{done}/{tasks.length}</span>
      </div>
      <div className="mb-3 h-1.5 rounded-full bg-white/60">
        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <ul className="divide-y divide-white/50">
        {tasks.map((t) => <TaskRow key={t.id} task={t} />)}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Producer card
// ---------------------------------------------------------------------------

function ProducerCard({ producer }: { producer: Producer }) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const tasksByPhase: Record<number, Task[]> = { 1: [], 2: [], 3: [] };
  for (const t of producer.tasks) {
    (tasksByPhase[t.phase] ??= []).push(t);
  }

  const totalTasks = producer.tasks.length;
  const doneTasks = producer.tasks.filter((t) => t.status === "DONE").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const statusOrder: PilotStatus[] = [
    "IDENTIFIED", "CONTACTED", "NEGOTIATING", "ONBOARDED", "BETA_TESTING", "ACTIVE", "DECLINED",
  ];

  return (
    <div className="rounded-3xl border border-stone-200 bg-white overflow-hidden">
      {/* Header */}
      <div
        className="flex cursor-pointer items-start gap-4 p-5 hover:bg-stone-50"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-lg select-none">
          {CATEGORY_ICONS[producer.category] ?? "🌿"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-stone-800">{producer.producerName}</p>
            <StatusBadge status={producer.status} />
            {producer.founderDiscount && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Fundador 10%
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-stone-500">
            {producer.category}
            {producer.location ? ` · ${producer.location}` : ""}
          </p>
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
          {/* Info del productor */}
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

          {/* Cambiar estado */}
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

          {/* Notas */}
          {producer.notes ? (
            <div className="rounded-2xl bg-stone-50 p-3 text-sm text-stone-600 italic">
              {producer.notes}
            </div>
          ) : null}

          {/* Tareas por fase */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Tareas por fase
            </p>
            {[1, 2, 3].map((phase) =>
              tasksByPhase[phase]?.length ? (
                <PhaseSection key={phase} phase={phase} tasks={tasksByPhase[phase]} />
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
};

// ---------------------------------------------------------------------------
// New producer form
// ---------------------------------------------------------------------------

function NewProducerForm({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition();

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
            {PILOT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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

export function PilotBoard({ producers }: { producers: Producer[] }) {
  const [showForm, setShowForm] = useState(false);

  // Agrupar por categoría para detectar huecos en el catálogo gourmet
  const coveredCategories = new Set(producers.filter(p => p.status !== "DECLINED").map((p) => p.category));
  const missingCategories = PILOT_CATEGORIES.filter((c) => !coveredCategories.has(c));

  const active = producers.filter((p) => p.status !== "DECLINED");
  const declined = producers.filter((p) => p.status === "DECLINED");

  return (
    <div className="space-y-6">
      {/* Alerta de categorías sin cubrir */}
      {missingCategories.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm">
          <p className="font-medium text-amber-800">Categorías del catálogo gourmet sin productor asignado:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missingCategories.map((c) => (
              <span key={c} className="rounded-full bg-amber-100 border border-amber-200 px-3 py-0.5 text-xs font-medium text-amber-700">
                {CATEGORY_ICONS[c]} {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          {active.length} productor{active.length !== 1 ? "es" : ""} en seguimiento
          {declined.length > 0 ? ` · ${declined.length} declinado${declined.length !== 1 ? "s" : ""}` : ""}
        </p>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary text-sm">
            + Añadir productor
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && <NewProducerForm onClose={() => setShowForm(false)} />}

      {/* Tarjetas activas */}
      {active.length === 0 && !showForm ? (
        <div className="rounded-3xl border border-dashed border-stone-300 p-10 text-center text-stone-400">
          <p className="text-4xl mb-3">🌱</p>
          <p className="font-medium">Aún no hay productores piloto registrados.</p>
          <p className="text-sm mt-1">Añade los 5 candidatos del catálogo gourmet de lanzamiento.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {active.map((p) => <ProducerCard key={p.id} producer={p} />)}
        </div>
      )}

      {/* Declinados (colapsados) */}
      {declined.length > 0 && (
        <details className="rounded-2xl border border-stone-200">
          <summary className="cursor-pointer px-5 py-3 text-sm text-stone-500 hover:bg-stone-50">
            {declined.length} productor{declined.length !== 1 ? "es" : ""} declinado{declined.length !== 1 ? "s" : ""}
          </summary>
          <div className="grid gap-3 p-4 lg:grid-cols-2">
            {declined.map((p) => <ProducerCard key={p.id} producer={p} />)}
          </div>
        </details>
      )}

      {/* Leyenda de fases */}
      <div className="rounded-3xl border border-stone-100 bg-stone-50 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-3">
          Referencia — Checklist de cada fase
        </p>
        <div className="grid gap-4 sm:grid-cols-3 text-xs text-stone-600">
          <div>
            <p className="font-semibold text-amber-700 mb-1">Fase 1 (Mes 2) · Selección</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Investigar empresa y catálogo</li>
              <li>Preparar ficha de propuesta</li>
              <li>Verificar no-perecederos</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-blue-700 mb-1">Fase 2 (Mes 3) · Captación</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Visita presencial</li>
              <li>Oferta Fundadores 10%</li>
              <li>Fotografía + fichas IA</li>
              <li>Firma contrato + Stripe</li>
              <li>Depósito stock trastienda</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-violet-700 mb-1">Fase 3 (Mes 5) · Beta</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Pedidos simulados (Bizum + tarjeta)</li>
              <li>Verificar SMS/email artesano</li>
              <li>Auditar entrega 24/48h Madrid</li>
              <li>Validar split 10%/90% Stripe</li>
              <li>Recoger testimonio marketing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
