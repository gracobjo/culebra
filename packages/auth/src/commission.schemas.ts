import { z } from "zod";

export const commissionRuleCreateSchema = z
  .object({
    ruleType: z.enum(["PERCENTAGE", "FIXED", "CATEGORY"]),
    percentage: z.coerce.number().min(0).max(100).optional(),
    fixedAmount: z.coerce.number().min(0).optional(),
    categoryId: z.string().trim().min(1).max(40).optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.ruleType === "PERCENTAGE" && value.percentage === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["percentage"],
        message: "PERCENTAGE requiere percentage",
      });
    }
    if (value.ruleType === "FIXED" && value.fixedAmount === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["fixedAmount"],
        message: "FIXED requiere fixedAmount",
      });
    }
    if (value.ruleType === "CATEGORY") {
      if (value.percentage === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["percentage"],
          message: "CATEGORY requiere percentage",
        });
      }
      if (!value.categoryId) {
        ctx.addIssue({
          code: "custom",
          path: ["categoryId"],
          message: "CATEGORY requiere categoryId",
        });
      }
    }
  });

export type CommissionRuleCreateInput = z.infer<typeof commissionRuleCreateSchema>;
