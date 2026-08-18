import { z } from "zod";

export const contractVersionCreateSchema = z.object({
  conditions: z.string().trim().min(20).max(50000).optional(),
  commissionPercent: z.coerce.number().min(0).max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  observations: z.string().trim().max(5000).optional(),
  documentUrl: z.string().trim().url().max(500).optional(),
});

export type ContractVersionCreateInput = z.infer<
  typeof contractVersionCreateSchema
>;
