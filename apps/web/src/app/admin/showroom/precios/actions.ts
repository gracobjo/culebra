"use server";

import {
  resetShowroomPriceCatalogToDefaults,
  showroomPriceBulkUpdateSchema,
  updateShowroomPriceCatalogBulk,
} from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type ShowroomPricingActionState = {
  ok: boolean;
  message: string;
};

function revalidatePricingPaths() {
  revalidatePath("/admin/showroom/precios");
  revalidatePath("/admin/showroom");
  revalidatePath("/admin/packaging");
  revalidatePath("/admin/plan");
}

export async function saveShowroomPricingAction(
  _prev: ShowroomPricingActionState,
  formData: FormData,
): Promise<ShowroomPricingActionState> {
  await requireAdmin("/admin/showroom/precios");

  const ids = formData.getAll("id").map(String);
  const items = ids.map((id) => {
    const costRaw = String(formData.get(`costEur_${id}`) ?? "").trim();
    const pvpRaw = String(formData.get(`pvpEur_${id}`) ?? "").trim();
    const notesRaw = String(formData.get(`notes_${id}`) ?? "").trim();
    return {
      id,
      label: String(formData.get(`label_${id}`) ?? "").trim() || undefined,
      costEur: costRaw === "" ? null : Number(costRaw.replace(",", ".")),
      pvpEur: pvpRaw === "" ? null : Number(pvpRaw.replace(",", ".")),
      notes: notesRaw === "" ? null : notesRaw,
      isActive: formData.get(`isActive_${id}`) === "on",
    };
  });

  const parsed = showroomPriceBulkUpdateSchema.safeParse({ items });
  if (!parsed.success) {
    return { ok: false, message: "Revisa los importes (números ≥ 0)." };
  }

  await updateShowroomPriceCatalogBulk(parsed.data);
  revalidatePricingPaths();
  return {
    ok: true,
    message: "Precios guardados. Showroom, packaging y plan usarán estos valores.",
  };
}

export async function resetShowroomPricingAction(): Promise<void> {
  await requireAdmin("/admin/showroom/precios");
  await resetShowroomPriceCatalogToDefaults();
  revalidatePricingPaths();
}
