"use server";

import {
  commissionRuleCreateSchema,
  contractVersionCreateSchema,
  createCommissionRuleForAdmin,
  createContractVersionForAdmin,
  productStatusUpdateSchema,
  publishContractVersionForAdmin,
  updateProductStatusByAdmin,
  updateUserStatusByAdmin,
  updateVendorStatusByAdmin,
  vendorStatusUpdateSchema,
} from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export type AdminActionState = {
  error?: string;
  success?: string;
};

export async function updateVendorStatusAction(
  vendorId: string,
  formData: FormData,
): Promise<void> {
  const admin = await requireAdmin(`/admin/productores/${vendorId}`);
  const parsed = vendorStatusUpdateSchema.safeParse({
    status: formData.get("status"),
    reviewNotes: formData.get("reviewNotes") || undefined,
  });
  if (!parsed.success) {
    return;
  }
  await updateVendorStatusByAdmin(vendorId, admin.id, parsed.data);
  revalidatePath("/admin");
  revalidatePath("/admin/productores");
  revalidatePath(`/admin/productores/${vendorId}`);
}

export async function updateProductStatusAction(
  productId: string,
  formData: FormData,
): Promise<void> {
  const admin = await requireAdmin("/admin/productos");
  const parsed = productStatusUpdateSchema.safeParse({
    status: formData.get("status"),
    rejectionReason: formData.get("rejectionReason") || undefined,
  });
  if (!parsed.success) {
    return;
  }
  await updateProductStatusByAdmin(productId, admin.id, parsed.data);
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
}

export async function createContractVersionAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin("/admin/contratos");
  const vendorId = String(formData.get("vendorId") ?? "");
  const parsed = contractVersionCreateSchema.safeParse({
    conditions: formData.get("conditions") || undefined,
    commissionPercent: formData.get("commissionPercent") || undefined,
    observations: formData.get("observations") || undefined,
  });
  if (!vendorId || !parsed.success) {
    return { error: "Revisa el productor y el texto del contrato (minimo 20 caracteres)." };
  }
  try {
    await createContractVersionForAdmin(admin.id, vendorId, parsed.data);
    revalidatePath("/admin/contratos");
    revalidatePath(`/admin/productores/${vendorId}`);
    return { success: "Version de contrato creada en borrador." };
  } catch (error) {
    if (error instanceof Error && error.message === "CONTRACT_PENDING_EXISTS") {
      return { error: "Ya hay una version pendiente de firma." };
    }
    return { error: "No se pudo crear el contrato." };
  }
}

export async function publishContractAction(contractId: string, versionId: string): Promise<void> {
  const admin = await requireAdmin("/admin/contratos");
  await publishContractVersionForAdmin(admin.id, contractId, versionId);
  revalidatePath("/admin");
  revalidatePath("/admin/contratos");
  revalidatePath(`/admin/contratos/${contractId}`);
}

export async function createCommissionRuleAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin("/admin/productores");
  const vendorId = String(formData.get("vendorId") ?? "");
  const parsed = commissionRuleCreateSchema.safeParse({
    ruleType: formData.get("ruleType") || "PERCENTAGE",
    percentage: formData.get("percentage") || undefined,
    fixedAmount: formData.get("fixedAmount") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!vendorId || !parsed.success) {
    return { error: "Revisa tipo e importe de la comision." };
  }
  try {
    await createCommissionRuleForAdmin(admin.id, vendorId, parsed.data);
    revalidatePath(`/admin/productores/${vendorId}`);
    return { success: "Nueva version de comision creada." };
  } catch {
    return { error: "No se pudo crear la regla de comision." };
  }
}

export async function updateUserStatusAction(userId: string, formData: FormData): Promise<void> {
  const admin = await requireAdmin("/admin/usuarios");
  const status = formData.get("status");
  if (status !== "ACTIVE" && status !== "SUSPENDED") {
    return;
  }
  await updateUserStatusByAdmin(userId, admin.id, status);
  revalidatePath("/admin/usuarios");
}
