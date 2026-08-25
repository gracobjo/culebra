"use server";

import {
  addStampToCard,
  clubJoinSchema,
  createStampCardForAdmin,
  joinShowroomClub,
  markReferralRewarded,
  referralCreateSchema,
  registerReferral,
  registerScratchPlay,
  redeemStampCard,
  scratchPlaySchema,
  stampCardCreateSchema,
  updateLoyaltyMonthSettings,
  loyaltyMonthSettingsSchema,
} from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type LoyaltyAdminState = {
  error?: string;
  success?: string;
  scratchResult?: {
    won: boolean;
    prizeLabel: string | null;
    playNumber: number;
  };
};

const path = "/admin/showroom/fidelizacion";

function formBool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export async function scratchPlayAction(
  _prev: LoyaltyAdminState,
  formData: FormData,
): Promise<LoyaltyAdminState> {
  await requireAdmin(path);
  const parsed = scratchPlaySchema.safeParse({
    entryType: formData.get("entryType"),
    customerLabel: formData.get("customerLabel"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: "Indica si es visita o compra." };

  try {
    const result = await registerScratchPlay(parsed.data);
    revalidatePath(path);
    return {
      success: result.won
        ? `¡Premio! ${result.prizeLabel} (rasca #${result.playNumber})`
        : `Sin premio esta vez (rasca #${result.playNumber}).`,
      scratchResult: {
        won: result.won,
        prizeLabel: result.prizeLabel,
        playNumber: result.playNumber,
      },
    };
  } catch {
    return { error: "No se pudo registrar el rasca." };
  }
}

export async function createStampCardAction(
  _prev: LoyaltyAdminState,
  formData: FormData,
): Promise<LoyaltyAdminState> {
  await requireAdmin(path);
  const parsed = stampCardCreateSchema.safeParse({
    customerName: formData.get("customerName"),
    contactHint: formData.get("contactHint"),
    stampsRequired: formData.get("stampsRequired"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: "Nombre obligatorio." };

  try {
    const card = await createStampCardForAdmin(parsed.data);
    revalidatePath(path);
    return { success: `Tarjeta ${card.cardCode} creada para ${card.customerName}.` };
  } catch {
    return { error: "No se pudo crear la tarjeta." };
  }
}

export async function addStampAction(
  _prev: LoyaltyAdminState,
  formData: FormData,
): Promise<LoyaltyAdminState> {
  await requireAdmin(path);
  const cardId = String(formData.get("cardId") ?? "");
  if (!cardId) return { error: "Tarjeta no indicada." };

  try {
    const card = await addStampToCard(cardId, String(formData.get("notes") ?? "") || undefined);
    revalidatePath(path);
    const msg =
      card.status === "COMPLETED"
        ? `${card.cardCode}: ¡tarjeta completa! Premio: tote, mini-cesta o 15 %.`
        : `${card.cardCode}: sello ${card.stampsCount}/${card.stampsRequired}.`;
    return { success: msg };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al añadir sello." };
  }
}

export async function redeemStampAction(
  _prev: LoyaltyAdminState,
  formData: FormData,
): Promise<LoyaltyAdminState> {
  await requireAdmin(path);
  const cardId = String(formData.get("cardId") ?? "");
  try {
    const card = await redeemStampCard(cardId);
    revalidatePath(path);
    return { success: `${card.cardCode} canjeada.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo canjear." };
  }
}

export async function clubJoinAction(
  _prev: LoyaltyAdminState,
  formData: FormData,
): Promise<LoyaltyAdminState> {
  await requireAdmin(path);
  const parsed = clubJoinSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact"),
    channel: formData.get("channel"),
    originGroup: formData.get("originGroup") || undefined,
    birthday: formData.get("birthday"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: "Nombre y contacto obligatorios." };

  try {
    const member = await joinShowroomClub(parsed.data);
    revalidatePath(path);
    return {
      success: `${member.name} en el Club. Código sugerido: ${member.promoCode ?? "—"}`,
    };
  } catch {
    return { error: "No se pudo dar de alta en el club." };
  }
}

export async function referralAction(
  _prev: LoyaltyAdminState,
  formData: FormData,
): Promise<LoyaltyAdminState> {
  await requireAdmin(path);
  const parsed = referralCreateSchema.safeParse({
    referrerName: formData.get("referrerName"),
    referredName: formData.get("referredName"),
    referredPurchased: formBool(formData, "referredPurchased"),
    rewardGiven: formBool(formData, "rewardGiven"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: "Indica quién trae y a quién." };

  try {
    await registerReferral(parsed.data);
    revalidatePath(path);
    return { success: "Referido registrado." };
  } catch {
    return { error: "No se pudo registrar." };
  }
}

export async function markReferralRewardedAction(
  _prev: LoyaltyAdminState,
  formData: FormData,
): Promise<LoyaltyAdminState> {
  await requireAdmin(path);
  const id = String(formData.get("id") ?? "");
  try {
    await markReferralRewarded(id);
    revalidatePath(path);
    return { success: "Premio de referido marcado como entregado." };
  } catch {
    return { error: "No se pudo actualizar." };
  }
}

export async function loyaltySettingsAction(
  _prev: LoyaltyAdminState,
  formData: FormData,
): Promise<LoyaltyAdminState> {
  await requireAdmin(path);
  const parsed = loyaltyMonthSettingsSchema.safeParse({
    monthKey: formData.get("monthKey"),
    scratchWinEveryN: formData.get("scratchWinEveryN"),
    scratchMaxWins: formData.get("scratchMaxWins"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: "Revisa la configuración del mes." };

  try {
    await updateLoyaltyMonthSettings(parsed.data);
    revalidatePath(path);
    return { success: `Mes ${parsed.data.monthKey} actualizado.` };
  } catch {
    return { error: "No se pudo guardar." };
  }
}
