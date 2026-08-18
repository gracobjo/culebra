import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .email("Email invalido")
  .max(255);

export const passwordSchema = z
  .string()
  .min(8, "La contrasena debe tener al menos 8 caracteres")
  .max(128)
  .regex(/[A-Za-z]/, "La contrasena debe incluir al menos una letra")
  .regex(/[0-9]/, "La contrasena debe incluir al menos un numero");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().max(30).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Contrasena obligatoria").max(128),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
