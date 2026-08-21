"use server";

import { requireAdmin } from "@/lib/admin";
import { closeRappelYear } from "@/lib/rappels";
import { prisma } from "@culebra/db";
import type { RappelPaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function toStringOrEmpty(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function parseYear(raw: string): number | null {
  const y = Number.parseInt(raw, 10);
  if (!Number.isFinite(y) || y < 2020 || y > 2100) return null;
  return y;
}

export async function closeRappelYearAction(formData: FormData) {
  const admin = await requireAdmin();
  const year = parseYear(toStringOrEmpty(formData.get("year")));
  if (year == null) {
    redirect("/admin/rappels?error=INVALID_YEAR");
  }

  const result = await closeRappelYear(year, admin.id);
  revalidatePath("/admin/rappels");
  redirect(
    `/admin/rappels?closed=${year}&created=${result.created}&skipped=${result.skippedExisting}`,
  );
}

export async function markRappelPaidAction(formData: FormData) {
  await requireAdmin();
  const id = toStringOrEmpty(formData.get("settlementId"));
  const methodRaw = toStringOrEmpty(formData.get("paymentMethod")) || "TRANSFER";
  const notes = toStringOrEmpty(formData.get("notes")) || null;

  if (!id) {
    redirect("/admin/rappels?error=MISSING_SETTLEMENT");
  }

  const method = (methodRaw === "PAYOUT_OFFSET" ? "PAYOUT_OFFSET" : "TRANSFER") as RappelPaymentMethod;

  const settlement = await prisma.rappelSettlement.findUnique({ where: { id } });
  if (!settlement || settlement.status !== "PENDING") {
    redirect("/admin/rappels?error=NOT_PENDING");
  }

  await prisma.rappelSettlement.update({
    where: { id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paymentMethod: method,
      notes,
    },
  });

  revalidatePath("/admin/rappels");
  redirect("/admin/rappels?paid=1");
}

export async function cancelRappelSettlementAction(formData: FormData) {
  await requireAdmin();
  const id = toStringOrEmpty(formData.get("settlementId"));
  const notes = toStringOrEmpty(formData.get("notes")) || null;

  if (!id) {
    redirect("/admin/rappels?error=MISSING_SETTLEMENT");
  }

  const settlement = await prisma.rappelSettlement.findUnique({ where: { id } });
  if (!settlement || settlement.status !== "PENDING") {
    redirect("/admin/rappels?error=NOT_PENDING");
  }

  await prisma.rappelSettlement.update({
    where: { id },
    data: {
      status: "CANCELLED",
      notes: notes ?? settlement.notes,
    },
  });

  revalidatePath("/admin/rappels");
  redirect("/admin/rappels?cancelled=1");
}
