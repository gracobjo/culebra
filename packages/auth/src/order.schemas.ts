import { z } from "zod";

export const guestOrderLookupSchema = z.object({
  orderNumber: z.string().trim().min(3).max(40),
  email: z.string().trim().email().max(255),
});

export const shipVendorOrderSchema = z.object({
  carrier: z.string().trim().max(80).optional(),
  trackingNumber: z.string().trim().max(80).optional(),
});

export const vendorOrderStatusSchema = z.object({
  status: z.enum([
    "CONFIRMED",
    "IN_PREPARATION",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
  carrier: z.string().trim().max(80).optional(),
  trackingNumber: z.string().trim().max(80).optional(),
});

export type GuestOrderLookupInput = z.infer<typeof guestOrderLookupSchema>;
export type ShipVendorOrderInput = z.infer<typeof shipVendorOrderSchema>;
export type VendorOrderStatusInput = z.infer<typeof vendorOrderStatusSchema>;
