import { z } from "zod";

const optionalString = z
  .union([z.string(), z.literal(""), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null || v === "") return undefined;
    return String(v).trim() || undefined;
  });

const intField = (min = 0, max = 999_999) =>
  z.coerce.number().int().min(min).max(max);

const decimalField = (min = 0, max = 999_999) =>
  z.coerce.number().min(min).max(max);

const boolField = z
  .union([z.boolean(), z.string(), z.number()])
  .transform((v) => v === true || v === "true" || v === "on" || v === 1 || v === "1");

export const showroomDailyStatUpsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha YYYY-MM-DD"),
  open: boolField.optional().default(true),
  visits: intField().optional().default(0),
  purchases: intField().optional().default(0),
  gmv: decimalField().optional().default(0),
  avgTicketBase: decimalField().optional().default(0),
  impulseAttachPct: decimalField(0, 100).optional().default(0),
  impulseAvgEur: decimalField().optional().default(0),
  quickBuyPct: decimalField(0, 100).optional().default(0),
  quickBuyTicket: decimalField().optional().default(0),
  mielU: intField().optional().default(0),
  loncheadoU: intField().optional().default(0),
  mermeladaU: intField().optional().default(0),
  quesoU: intField().optional().default(0),
  toteU: intField().optional().default(0),
  picosU: intField().optional().default(0),
  vinoU: intField().optional().default(0),
  minicataU: intField().optional().default(0),
  toteStock: intField().optional().default(0),
  onlineOrders: intField().optional().default(0),
  onlineOrdersAttr: intField().optional().default(0),
  contacts: intField().optional().default(0),
  referredVisits: intField().optional().default(0),
  basketsViaLodging: intField().optional().default(0),
  partnersActive: intField().optional().default(0),
  promotion: boolField.optional().default(false),
  holidayOrEvent: boolField.optional().default(false),
  marketSegment: optionalString,
  distributionChannel: optionalString,
  notes: optionalString,
});

export type ShowroomDailyStatUpsertInput = z.infer<
  typeof showroomDailyStatUpsertSchema
>;

export const showroomDailyStatSyncSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
