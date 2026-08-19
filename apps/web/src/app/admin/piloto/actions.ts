"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@culebra/db";
import { revalidatePath } from "next/cache";
import { PilotStatus, PilotTaskStatus } from "@prisma/client";

export async function createPilotProducer(formData: FormData) {
  await requireAdmin();

  const producerName = formData.get("producerName") as string;
  const category = formData.get("category") as string;
  const contactPerson = formData.get("contactPerson") as string | null;
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const location = formData.get("location") as string | null;
  const notes = formData.get("notes") as string | null;

  if (!producerName || !category) return;

  const producer = await prisma.pilotProducer.create({
    data: {
      producerName,
      category,
      contactPerson: contactPerson || null,
      phone: phone || null,
      email: email || null,
      location: location || null,
      notes: notes || null,
      status: "IDENTIFIED",
      commissionPct: 10,
      founderDiscount: true,
    },
  });

  // Crear tareas por defecto para las 3 fases
  const defaultTasks = [
    // Fase 1 – Selección
    { phase: 1, title: "Investigar empresa y productos", assignedTo: "Socio 2 (Comercial)" },
    { phase: 1, title: "Preparar ficha de propuesta de valor", assignedTo: "Socio 2 (Comercial)" },
    { phase: 1, title: "Verificar que los productos son no perecederos", assignedTo: "Socio 2 (Comercial)" },
    // Fase 2 – Captación
    { phase: 2, title: "Visita presencial / café en sus instalaciones", assignedTo: "Socio 1 + Socio 2" },
    { phase: 2, title: "Entregar oferta Fundadores (10% primer año)", assignedTo: "Socio 1 + Socio 2" },
    { phase: 2, title: "Fotografía productos en alta definición (DAW)", assignedTo: "Informático DAW" },
    { phase: 2, title: "Redactar fichas técnicas con IA", assignedTo: "Informático DAW" },
    { phase: 2, title: "Firmar contrato y activar cuenta Stripe Connect", assignedTo: "Informático DAW" },
    { phase: 2, title: "Depositar stock inicial en trastienda Villardeciervos", assignedTo: "Socio 2 (Comercial)" },
    // Fase 3 – Beta
    { phase: 3, title: "Pedido simulado con Bizum desde móvil", assignedTo: "Socios S.L." },
    { phase: 3, title: "Pedido simulado con tarjeta de crédito", assignedTo: "Socios S.L." },
    { phase: 3, title: "Verificar SMS/email de alerta al artesano", assignedTo: "Informático DAW" },
    { phase: 3, title: "Auditar recogida transporte y entrega 24/48h Madrid", assignedTo: "Socio 1" },
    { phase: 3, title: "Validar split Stripe: 10% S.L. / 90% artesano", assignedTo: "Informático DAW" },
    { phase: 3, title: "Recoger testimonio del artesano para marketing", assignedTo: "Socio 2 (Comercial)" },
  ];

  await prisma.pilotTask.createMany({
    data: defaultTasks.map((t) => ({
      pilotProducerId: producer.id,
      phase: t.phase,
      title: t.title,
      assignedTo: t.assignedTo,
      status: "PENDING" as PilotTaskStatus,
    })),
  });

  revalidatePath("/admin/piloto");
}

export async function updatePilotStatus(id: string, status: PilotStatus) {
  await requireAdmin();
  const data: Record<string, unknown> = { status };
  if (status === "ONBOARDED") data.onboardedAt = new Date();
  if (status === "CONTACTED") data.visitDate = new Date();
  await prisma.pilotProducer.update({ where: { id }, data });
  revalidatePath("/admin/piloto");
}

export async function updateTaskStatus(taskId: string, status: PilotTaskStatus) {
  await requireAdmin();
  const data: Record<string, unknown> = { status };
  if (status === "DONE") data.completedAt = new Date();
  await prisma.pilotTask.update({ where: { id: taskId }, data });
  revalidatePath("/admin/piloto");
}

export async function updatePilotNotes(id: string, notes: string) {
  await requireAdmin();
  await prisma.pilotProducer.update({ where: { id }, data: { notes } });
  revalidatePath("/admin/piloto");
}
