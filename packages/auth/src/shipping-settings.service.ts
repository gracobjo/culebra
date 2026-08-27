import {
  CUSTOMER_SHIPPING_FEE_EUR,
  MARKETPLACE_SHIPPING_COST_EUR,
} from "@culebra/domain";
import { prisma } from "@culebra/db";

import type { ShippingSettingsUpsertInput } from "./shipping-settings.schemas.js";

export type ShippingSettingsRecord = {
  id: number;
  customerFeeEur: number;
  internalLabelCostEur: number;
  updatedAt: Date;
};

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function defaults(): ShippingSettingsRecord {
  return {
    id: 1,
    customerFeeEur: CUSTOMER_SHIPPING_FEE_EUR,
    internalLabelCostEur: MARKETPLACE_SHIPPING_COST_EUR,
    updatedAt: new Date(0),
  };
}

function mapRow(row: {
  id: number;
  customerFeeEur: unknown;
  internalLabelCostEur: unknown;
  updatedAt: Date;
}): ShippingSettingsRecord {
  return {
    id: row.id,
    customerFeeEur: asNumber(row.customerFeeEur),
    internalLabelCostEur: asNumber(row.internalLabelCostEur),
    updatedAt: row.updatedAt,
  };
}

function shippingSettingsDelegate() {
  return (
    prisma as
      | {
          shippingSettings?: {
            findUnique: typeof prisma.shippingSettings.findUnique;
            upsert: typeof prisma.shippingSettings.upsert;
          };
        }
      | undefined
  )?.shippingSettings;
}

/** Lee la tarifa activa; si no hay fila/migración, usa constantes de dominio. */
export async function getShippingSettings(): Promise<ShippingSettingsRecord> {
  try {
    const delegate = shippingSettingsDelegate();
    if (!delegate) return defaults();
    const row = await delegate.findUnique({ where: { id: 1 } });
    if (!row) return defaults();
    return mapRow(row);
  } catch {
    return defaults();
  }
}

export async function getCustomerShippingFeeEur(): Promise<number> {
  const settings = await getShippingSettings();
  return settings.customerFeeEur;
}

export async function upsertShippingSettingsForAdmin(
  input: ShippingSettingsUpsertInput,
): Promise<ShippingSettingsRecord> {
  const delegate = shippingSettingsDelegate();
  if (!delegate) {
    throw new Error(
      "Prisma no tiene ShippingSettings. Ejecuta la migración y reinicia el servidor.",
    );
  }

  const row = await delegate.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      customerFeeEur: input.customerFeeEur,
      internalLabelCostEur: input.internalLabelCostEur,
    },
    update: {
      customerFeeEur: input.customerFeeEur,
      internalLabelCostEur: input.internalLabelCostEur,
    },
  });
  return mapRow(row);
}
