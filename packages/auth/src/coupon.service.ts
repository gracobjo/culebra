import { CouponDiscountType } from "@culebra/domain";
import { prisma } from "@culebra/db";

import type { CouponUpsertInput } from "./coupon.schemas.js";

export type CouponRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: string;
  minOrderAmount: string | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CouponPreview = {
  code: string;
  name: string;
  discountAmount: string;
  discountType: CouponDiscountType;
  discountValue: string;
};

function mapCoupon(row: {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: unknown;
  minOrderAmount: unknown;
  maxRedemptions: number | null;
  redemptionCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CouponRecord {
  return {
    ...row,
    discountType: row.discountType as CouponDiscountType,
    discountValue: String(row.discountValue),
    minOrderAmount: row.minOrderAmount == null ? null : String(row.minOrderAmount),
  };
}

export function computeCouponDiscount(
  coupon: {
    discountType: string;
    discountValue: unknown;
    minOrderAmount?: unknown;
  },
  subtotalGross: number,
): number {
  const minOrder =
    coupon.minOrderAmount == null ? 0 : Number(coupon.minOrderAmount);
  if (subtotalGross < minOrder) {
    throw new Error("COUPON_MIN_ORDER");
  }

  const value = Number(coupon.discountValue);
  let discount =
    coupon.discountType === CouponDiscountType.PERCENTAGE
      ? Number(((subtotalGross * value) / 100).toFixed(2))
      : Number(value.toFixed(2));

  if (discount > subtotalGross) {
    discount = subtotalGross;
  }
  if (discount < 0) {
    discount = 0;
  }
  return Number(discount.toFixed(2));
}

export async function getActiveCouponByCode(code: string) {
  const normalized = code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });
  if (!coupon || !coupon.isActive) {
    return null;
  }
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return null;
  if (coupon.endsAt && coupon.endsAt < now) return null;
  if (
    coupon.maxRedemptions != null &&
    coupon.redemptionCount >= coupon.maxRedemptions
  ) {
    return null;
  }
  return mapCoupon(coupon);
}

export async function previewCoupon(
  code: string,
  subtotalGross: number,
): Promise<CouponPreview> {
  const coupon = await getActiveCouponByCode(code);
  if (!coupon) {
    throw new Error("COUPON_INVALID");
  }
  const discountAmount = computeCouponDiscount(coupon, subtotalGross);
  return {
    code: coupon.code,
    name: coupon.name,
    discountAmount: discountAmount.toFixed(2),
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
  };
}

export async function listCouponsForAdmin() {
  const rows = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCoupon);
}

export async function upsertCouponForAdmin(
  input: CouponUpsertInput,
  id?: string,
): Promise<CouponRecord> {
  if (
    input.discountType === CouponDiscountType.PERCENTAGE &&
    input.discountValue > 100
  ) {
    throw new Error("COUPON_PERCENT_TOO_HIGH");
  }

  const data = {
    code: input.code,
    name: input.name,
    description: input.description ?? null,
    discountType: input.discountType,
    discountValue: input.discountValue,
    minOrderAmount: input.minOrderAmount ?? null,
    maxRedemptions: input.maxRedemptions ?? null,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
    isActive: input.isActive,
  };

  const row = id
    ? await prisma.coupon.update({ where: { id }, data })
    : await prisma.coupon.create({ data });

  return mapCoupon(row);
}
