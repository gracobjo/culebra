"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@culebra/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PilotStatus, PilotTaskStatus } from "@prisma/client";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

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

  const categoryExists = await prisma.pilotCategory.findFirst({
    where: { name: category, isActive: true },
    select: { id: true },
  });
  if (!categoryExists) return;

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
      commissionPct: 12,
      founderDiscount: true,
    },
  });

  const defaultTasks = [
    { phase: 1, title: "Investigar empresa y productos", assignedTo: "Socio 2 (Comercial)" },
    { phase: 1, title: "Preparar ficha de propuesta de valor", assignedTo: "Socio 2 (Comercial)" },
    { phase: 1, title: "Verificar que los productos son no perecederos", assignedTo: "Socio 2 (Comercial)" },
    { phase: 2, title: "Visita presencial / café en sus instalaciones", assignedTo: "Socio 1 + Socio 2" },
    { phase: 2, title: "Entregar oferta Fundadores (12% primer año)", assignedTo: "Socio 1 + Socio 2" },
    { phase: 2, title: "Fotografía productos en alta definición (DAW)", assignedTo: "Informático DAW" },
    { phase: 2, title: "Redactar fichas técnicas con IA", assignedTo: "Informático DAW" },
    { phase: 2, title: "Firmar contrato y activar cuenta Stripe Connect", assignedTo: "Informático DAW" },
    { phase: 2, title: "Depositar stock inicial en trastienda Villardeciervos", assignedTo: "Socio 2 (Comercial)" },
    { phase: 3, title: "Pedido simulado con Bizum desde móvil", assignedTo: "Socios S.L." },
    { phase: 3, title: "Pedido simulado con tarjeta de crédito", assignedTo: "Socios S.L." },
    { phase: 3, title: "Verificar SMS/email de alerta al artesano", assignedTo: "Informático DAW" },
    {
      phase: 3,
      title: "Auditar recogida transporte y entrega 24/48h (demanda nacional)",
      assignedTo: "Socio 1",
    },
    { phase: 3, title: "Validar split Stripe: 12% S.L. / 88% artesano", assignedTo: "Informático DAW" },
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

export async function createPilotCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim() || null;
  const sortRaw = String(formData.get("sortOrder") ?? "").trim();
  if (!name) return;

  const baseSlug = slugify(name) || `cat-${Date.now()}`;
  let slug = baseSlug;
  let n = 2;
  while (await prisma.pilotCategory.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n}`;
    n += 1;
  }

  const maxSort = await prisma.pilotCategory.aggregate({ _max: { sortOrder: true } });
  const sortOrder = sortRaw ? Number(sortRaw) : (maxSort._max.sortOrder ?? 0) + 10;

  await prisma.pilotCategory.create({
    data: {
      name,
      slug,
      icon,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      isActive: true,
    },
  });

  revalidatePath("/admin/piloto");
}

export async function updatePilotCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim() || null;
  const sortRaw = String(formData.get("sortOrder") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "true") === "true";
  if (!id || !name) return;

  const existing = await prisma.pilotCategory.findUnique({ where: { id } });
  if (!existing) return;

  const sortOrder = sortRaw ? Number(sortRaw) : existing.sortOrder;

  await prisma.pilotCategory.update({
    where: { id },
    data: {
      name,
      icon,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : existing.sortOrder,
      isActive,
    },
  });

  if (existing.name !== name) {
    await prisma.pilotProducer.updateMany({
      where: { category: existing.name },
      data: { category: name },
    });
  }

  revalidatePath("/admin/piloto");
}

export async function deletePilotCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const existing = await prisma.pilotCategory.findUnique({ where: { id } });
  if (!existing) return;

  const inUse = await prisma.pilotProducer.count({
    where: { category: existing.name },
  });

  if (inUse > 0) {
    await prisma.pilotCategory.update({
      where: { id },
      data: { isActive: false },
    });
  } else {
    await prisma.pilotCategory.delete({ where: { id } });
  }

  revalidatePath("/admin/piloto");
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function savePilotValueProposition(formData: FormData) {
  await requireAdmin();
  const pilotProducerId = String(formData.get("pilotProducerId") ?? "").trim();
  if (!pilotProducerId) return;

  const producer = await prisma.pilotProducer.findUnique({
    where: { id: pilotProducerId },
    select: { id: true },
  });
  if (!producer) return;

  const statusRaw = String(formData.get("status") ?? "DRAFT").trim();
  const status = statusRaw === "READY" ? "READY" : "DRAFT";
  const markReady = String(formData.get("markReady") ?? "") === "1";
  const finalStatus = markReady ? "READY" : status;

  const data = {
    headline: emptyToNull(formData.get("headline")),
    context: emptyToNull(formData.get("context")),
    benefits: emptyToNull(formData.get("benefits")),
    offerTerms: emptyToNull(formData.get("offerTerms")),
    productMix: emptyToNull(formData.get("productMix")),
    nextSteps: emptyToNull(formData.get("nextSteps")),
    internalNotes: emptyToNull(formData.get("internalNotes")),
    preparedBy: emptyToNull(formData.get("preparedBy")),
    status: finalStatus,
    preparedAt: finalStatus === "READY" ? new Date() : null,
  };

  await prisma.pilotValueProposition.upsert({
    where: { pilotProducerId },
    create: { pilotProducerId, ...data },
    update: data,
  });

  if (finalStatus === "READY") {
    await prisma.pilotTask.updateMany({
      where: {
        pilotProducerId,
        title: "Preparar ficha de propuesta de valor",
        status: { not: "DONE" },
      },
      data: { status: "DONE", completedAt: new Date() },
    });
  }

  revalidatePath("/admin/piloto");
  revalidatePath(`/admin/piloto/${pilotProducerId}/propuesta`);
  redirect(`/admin/piloto/${pilotProducerId}/propuesta?saved=1`);
}
