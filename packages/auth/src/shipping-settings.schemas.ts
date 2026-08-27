import { z } from "zod";

export const shippingSettingsUpsertSchema = z.object({
  customerFeeEur: z.coerce.number().finite().min(0).max(9999.99),
  internalLabelCostEur: z.coerce.number().finite().min(0).max(9999.99),
});

export type ShippingSettingsUpsertInput = z.infer<typeof shippingSettingsUpsertSchema>;
