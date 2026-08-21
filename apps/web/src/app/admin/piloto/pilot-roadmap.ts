import type { PilotStatus } from "@prisma/client";

export type RoadmapMonth = 2 | 3 | 4 | 5 | 6;

export type RoadmapStep = {
  month: RoadmapMonth;
  label: string;
  icon: string;
  description: string;
  /** Fase de tareas (1–3) o null si solo filtra por estado */
  taskPhase: 1 | 2 | 3 | null;
  statusFilter: PilotStatus[] | null;
};

export const ROADMAP_STEPS: RoadmapStep[] = [
  {
    month: 2,
    label: "Selección catálogo gourmet",
    icon: "🛒",
    description:
      "Identificar candidatos y validar que encajan en el catálogo no perecedero.",
    taskPhase: 1,
    statusFilter: ["IDENTIFIED"],
  },
  {
    month: 3,
    label: "Captación puerta a puerta",
    icon: "🤝",
    description:
      "Visitas, oferta fundadores, fotos, contrato y Stripe Connect.",
    taskPhase: 2,
    statusFilter: ["CONTACTED", "NEGOTIATING"],
  },
  {
    month: 4,
    label: "Onboarding + fotografía",
    icon: "📸",
    description:
      "Productores en onboarding: fichas, fotos y activación en plataforma.",
    taskPhase: 2,
    statusFilter: ["ONBOARDED"],
  },
  {
    month: 5,
    label: "Ensayo general (Beta)",
    icon: "🧪",
    description:
      "Pedidos de prueba, logística, emails/SMS y validación del split de pagos.",
    taskPhase: 3,
    statusFilter: ["BETA_TESTING"],
  },
  {
    month: 6,
    label: "Lanzamiento público",
    icon: "🚀",
    description:
      "Productores ya activos como efecto llamada para la campaña de invierno.",
    taskPhase: null,
    statusFilter: ["ACTIVE"],
  },
];
