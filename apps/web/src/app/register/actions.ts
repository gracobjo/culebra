"use server";

import { registerSchema, registerUser } from "@culebra/auth";
import { signIn } from "@/auth";

export type RegisterActionState = {
  error?: string;
  success?: boolean;
};

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName") || undefined,
    lastName: formData.get("lastName") || undefined,
  });

  if (!parsed.success) {
    return { error: "Revisa los datos del formulario." };
  }

  try {
    await registerUser(parsed.data);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return { error: "Este email ya esta registrado." };
    }
    return { error: "No se pudo completar el registro." };
  }

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/cuenta",
  });

  return { success: true };
}
