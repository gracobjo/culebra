"use server";

import { acceptContractVersion } from "@culebra/auth";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type AcceptContractState = {
  error?: string;
  success?: string;
};

export async function acceptContractAction(
  _prevState: AcceptContractState,
  formData: FormData,
): Promise<AcceptContractState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesion." };
  }

  const versionId = formData.get("versionId");
  if (typeof versionId !== "string" || !versionId) {
    return { error: "Version de contrato invalida." };
  }

  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim();

  try {
    await acceptContractVersion(session.user.id, versionId, { ipAddress });
    revalidatePath("/panel/proveedor/contratos");
    revalidatePath("/panel/proveedor");
    revalidatePath("/panel/proveedor/productos");
    return { success: "Contrato aceptado correctamente." };
  } catch (error) {
    if (!(error instanceof Error)) {
      return { error: "No se pudo aceptar el contrato." };
    }
    const messages: Record<string, string> = {
      CONTRACT_FORBIDDEN: "No puedes aceptar este contrato.",
      CONTRACT_INVALID_STATUS: "Esta version ya no esta pendiente de firma.",
      CONTRACT_ALREADY_ACCEPTED: "Ya aceptaste esta version.",
      VENDOR_NOT_FOUND: "Perfil de productor no encontrado.",
    };
    return { error: messages[error.message] ?? "No se pudo aceptar el contrato." };
  }
}
