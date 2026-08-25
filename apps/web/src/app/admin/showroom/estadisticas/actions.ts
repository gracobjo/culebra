"use server";

import {
  deleteShowroomDailyStatForAdmin,
  importShowroomDailyStatsFromSyntheticCsv,
  showroomDailyStatSyncSchema,
  showroomDailyStatUpsertSchema,
  syncShowroomDailyStatsFromSystem,
  upsertShowroomDailyStatForAdmin,
} from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type ShowroomStatsAdminState = {
  error?: string;
  success?: string;
};

function formBool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export async function upsertShowroomDailyStatAction(
  _prev: ShowroomStatsAdminState,
  formData: FormData,
): Promise<ShowroomStatsAdminState> {
  await requireAdmin("/admin/showroom/estadisticas");

  const parsed = showroomDailyStatUpsertSchema.safeParse({
    date: formData.get("date"),
    open: formBool(formData, "open"),
    visits: formData.get("visits"),
    purchases: formData.get("purchases"),
    gmv: formData.get("gmv"),
    avgTicketBase: formData.get("avgTicketBase"),
    impulseAttachPct: formData.get("impulseAttachPct"),
    impulseAvgEur: formData.get("impulseAvgEur"),
    quickBuyPct: formData.get("quickBuyPct"),
    quickBuyTicket: formData.get("quickBuyTicket"),
    mielU: formData.get("mielU"),
    loncheadoU: formData.get("loncheadoU"),
    mermeladaU: formData.get("mermeladaU"),
    quesoU: formData.get("quesoU"),
    toteU: formData.get("toteU"),
    picosU: formData.get("picosU"),
    vinoU: formData.get("vinoU"),
    minicataU: formData.get("minicataU"),
    toteStock: formData.get("toteStock"),
    onlineOrders: formData.get("onlineOrders"),
    onlineOrdersAttr: formData.get("onlineOrdersAttr"),
    contacts: formData.get("contacts"),
    referredVisits: formData.get("referredVisits"),
    basketsViaLodging: formData.get("basketsViaLodging"),
    partnersActive: formData.get("partnersActive"),
    promotion: formBool(formData, "promotion"),
    holidayOrEvent: formBool(formData, "holidayOrEvent"),
    marketSegment: formData.get("marketSegment"),
    distributionChannel: formData.get("distributionChannel"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: "Revisa los campos del día (fecha obligatoria)." };
  }

  try {
    await upsertShowroomDailyStatForAdmin(parsed.data);
    revalidatePath("/admin/showroom/estadisticas");
    revalidatePath("/admin/showroom");
    return { success: `Día ${parsed.data.date} guardado.` };
  } catch {
    return { error: "No se pudo guardar el registro." };
  }
}

export async function deleteShowroomDailyStatAction(
  _prev: ShowroomStatsAdminState,
  formData: FormData,
): Promise<ShowroomStatsAdminState> {
  await requireAdmin("/admin/showroom/estadisticas");
  const date = String(formData.get("date") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Fecha no válida." };
  }

  try {
    await deleteShowroomDailyStatForAdmin(date);
    revalidatePath("/admin/showroom/estadisticas");
    return { success: `Día ${date} eliminado.` };
  } catch {
    return { error: "No se pudo eliminar (¿existía el registro?)." };
  }
}

export async function importShowroomDemoDataAction(
  _prev: ShowroomStatsAdminState,
): Promise<ShowroomStatsAdminState> {
  await requireAdmin("/admin/showroom/estadisticas");

  try {
    const result = await importShowroomDailyStatsFromSyntheticCsv({ replace: true });
    revalidatePath("/admin/showroom/estadisticas");
    return {
      success: `Demo cargado: ${result.imported} días (${result.openDays} abiertos). EDA y export CSV listos.`,
    };
  } catch {
    return { error: "No se pudo importar data/synthetic/culebra_showroom_daily.csv." };
  }
}

export async function syncShowroomDailyStatsAction(
  _prev: ShowroomStatsAdminState,
  formData: FormData,
): Promise<ShowroomStatsAdminState> {
  await requireAdmin("/admin/showroom/estadisticas");

  const parsed = showroomDailyStatSyncSchema.safeParse({
    from: formData.get("from"),
    to: formData.get("to"),
  });

  if (!parsed.success) {
    return { error: "Indica rango from/to (YYYY-MM-DD)." };
  }

  try {
    const result = await syncShowroomDailyStatsFromSystem(
      parsed.data.from,
      parsed.data.to,
    );
    revalidatePath("/admin/showroom/estadisticas");
    return {
      success: `Sincronizados ${result.daysSynced} días · partners activos: ${result.partnersActive}.`,
    };
  } catch {
    return { error: "Error al sincronizar desde pedidos y CRM." };
  }
}
