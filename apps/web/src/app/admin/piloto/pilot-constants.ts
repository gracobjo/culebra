import { PilotStatus, PilotTaskStatus } from "@prisma/client";

export const STATUS_META: Record<PilotStatus, { label: string; color: string; dot: string }> = {  IDENTIFIED: {
    label: "Identificado",
    color: "bg-stone-100 text-stone-700 border-stone-200",
    dot: "bg-stone-400",
  },
  CONTACTED: {
    label: "Contactado",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  NEGOTIATING: {
    label: "Negociando",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  ONBOARDED: {
    label: "Onboarding",
    color: "bg-violet-100 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  BETA_TESTING: {
    label: "Beta Test",
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    dot: "bg-cyan-500",
  },
  ACTIVE: {
    label: "Activo",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  DECLINED: {
    label: "Declinado",
    color: "bg-red-100 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
};

export const TASK_STATUS_META: Record<PilotTaskStatus, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "text-stone-400" },
  IN_PROGRESS: { label: "En curso", color: "text-amber-600" },
  DONE: { label: "Hecho", color: "text-emerald-600" },
  BLOCKED: { label: "Bloqueado", color: "text-red-600" },
};

export const PHASE_LABELS: Record<number, { label: string; month: string; color: string }> = {
  1: {
    label: "Fase 1 — Selección catálogo gourmet",
    month: "Mes 2",
    color: "bg-amber-50 border-amber-200",
  },
  2: {
    label: "Fase 2 — Captación puerta a puerta",
    month: "Mes 3",
    color: "bg-blue-50 border-blue-200",
  },
  3: {
    label: "Fase 3 — Ensayo general (Beta)",
    month: "Mes 5",
    color: "bg-violet-50 border-violet-200",
  },
};
