import { z } from "zod";

export const accommodationStatusSchema = z.enum(["DRAFT", "PUBLISHED", "DISABLED"]);
export const accommodationBookingChannelSchema = z.enum([
  "BOOKING",
  "WEBSITE",
  "WHATSAPP",
  "PHONE",
  "EMAIL",
  "OTHER",
]);

export const accommodationUpsertSchema = z.object({
  name: z.string().trim().min(2).max(200),
  shortDescription: z.string().trim().max(2000).optional(),
  longDescription: z.string().trim().max(20000).optional(),
  kind: z.string().trim().min(2).max(50).default("CASA_RURAL"),
  city: z.string().trim().max(100).optional(),
  municipality: z.string().trim().max(100).optional(),
  province: z.string().trim().max(100).default("Zamora"),
  address: z.string().trim().max(300).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional(),
  websiteUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  bookingUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  bookingChannel: accommodationBookingChannelSchema.default("WEBSITE"),
  imageUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  capacity: z.coerce.number().int().min(1).max(200).optional(),
  status: accommodationStatusSchema.default("DRAFT"),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  productIds: z.array(z.string().trim().min(1)).max(40).optional(),
});

export type AccommodationUpsertInput = z.infer<typeof accommodationUpsertSchema>;
