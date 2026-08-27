export type UserRole = "ADMIN" | "VENDOR" | "CONSUMER";

export const UserRole = {
  ADMIN: "ADMIN",
  VENDOR: "VENDOR",
  CONSUMER: "CONSUMER",
} as const;

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "PENDING_VERIFICATION";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "SIGN"
  | "LOGIN"
  | "LOGOUT"
  | "STATUS_CHANGE";

export const AuditAction = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  SIGN: "SIGN",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  STATUS_CHANGE: "STATUS_CHANGE",
} as const satisfies Record<string, AuditAction>;

export type ProductStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "DISABLED";

export const ProductStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  DISABLED: "DISABLED",
} as const satisfies Record<string, ProductStatus>;

export type PaymentStatus =
  | "PAYMENT_PENDING"
  | "PAYMENT_AUTHORIZED"
  | "PAYMENT_PAID"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_PARTIALLY_REFUNDED";

export const PaymentStatus = {
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAYMENT_AUTHORIZED: "PAYMENT_AUTHORIZED",
  PAYMENT_PAID: "PAYMENT_PAID",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_REFUNDED: "PAYMENT_REFUNDED",
  PAYMENT_PARTIALLY_REFUNDED: "PAYMENT_PARTIALLY_REFUNDED",
} as const satisfies Record<string, PaymentStatus>;

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAID"
  | "PARTIALLY_SHIPPED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export const OrderStatus = {
  PENDING: "PENDING",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAID: "PAID",
  PARTIALLY_SHIPPED: "PARTIALLY_SHIPPED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const satisfies Record<string, OrderStatus>;

export type VendorOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PREPARATION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export const VendorOrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PREPARATION: "IN_PREPARATION",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  RETURNED: "RETURNED",
} as const satisfies Record<string, VendorOrderStatus>;

export type ShipmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PREPARATION"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export const ShipmentStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PREPARATION: "IN_PREPARATION",
  SHIPPED: "SHIPPED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  RETURNED: "RETURNED",
} as const satisfies Record<string, ShipmentStatus>;

export type PayoutStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

export const PayoutStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const satisfies Record<string, PayoutStatus>;

export type VendorStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "SUSPENDED"
  | "REJECTED";

export const VendorStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  REJECTED: "REJECTED",
} as const satisfies Record<string, VendorStatus>;

export type VendorPayoutMethod = "STRIPE_CONNECT" | "PAYPAL";

export const VendorPayoutMethod = {
  STRIPE_CONNECT: "STRIPE_CONNECT",
  PAYPAL: "PAYPAL",
} as const satisfies Record<string, VendorPayoutMethod>;

/** Comision marketplace por defecto cuando no hay regla ni contrato especifico. */
export const DEFAULT_MARKETPLACE_COMMISSION_PERCENT = 17;

/** Tope comisión a canales externos (alojamiento, afiliados). */
export const MAX_EXTERNAL_CHANNEL_COMMISSION_PERCENT = 10;

/**
 * Suelo de comision por subpedido de productor (vendor order):
 * se aplica max(porcentaje, este minimo), sin superar el bruto del productor.
 */
export const DEFAULT_MIN_COMMISSION_EUR = 4;

/**
 * @deprecated No hay envío gratis. Se mantiene exportado por compatibilidad de API;
 * `computeShippingQuote` ya no usa umbral.
 */
export const FREE_SHIPPING_THRESHOLD_EUR = Number.POSITIVE_INFINITY;

/** Tarifa plana de envío por defecto (fallback si no hay fila en ShippingSettings). */
export const CUSTOMER_SHIPPING_FEE_EUR = 6.5;

/**
 * Coste interno orientativo de etiqueta por defecto (fallback admin / operativa).
 * La S.L. no lo absorbe: lo cubre el cargo al cliente.
 */
export const MARKETPLACE_SHIPPING_COST_EUR = 6.5;

export type ContractStatus =
  | "DRAFT"
  | "PENDING_SIGNATURE"
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "CANCELLED";

export const ContractStatus = {
  DRAFT: "DRAFT",
  PENDING_SIGNATURE: "PENDING_SIGNATURE",
  ACTIVE: "ACTIVE",
  EXPIRING_SOON: "EXPIRING_SOON",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const satisfies Record<string, ContractStatus>;

export type CommissionRuleType = "PERCENTAGE" | "FIXED" | "CATEGORY";

export const CommissionRuleType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
  CATEGORY: "CATEGORY",
} as const satisfies Record<string, CommissionRuleType>;

export type AccommodationStatus = "DRAFT" | "PUBLISHED" | "DISABLED";

export const AccommodationStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  DISABLED: "DISABLED",
} as const satisfies Record<string, AccommodationStatus>;

export type AccommodationBookingChannel =
  | "BOOKING"
  | "WEBSITE"
  | "WHATSAPP"
  | "PHONE"
  | "EMAIL"
  | "OTHER";

export const AccommodationBookingChannel = {
  BOOKING: "BOOKING",
  WEBSITE: "WEBSITE",
  WHATSAPP: "WHATSAPP",
  PHONE: "PHONE",
  EMAIL: "EMAIL",
  OTHER: "OTHER",
} as const satisfies Record<string, AccommodationBookingChannel>;

export type TourismPackStatus = "DRAFT" | "PUBLISHED" | "DISABLED";

export const TourismPackStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  DISABLED: "DISABLED",
} as const satisfies Record<string, TourismPackStatus>;

export type CouponDiscountType = "PERCENTAGE" | "FIXED";

export const CouponDiscountType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
} as const satisfies Record<string, CouponDiscountType>;

export type LodgingRelationStatus =
  | "PROSPECT"
  | "CONTACTED"
  | "MATERIAL_PLACED"
  | "ACTIVE"
  | "PAUSED"
  | "ENDED";

export const LodgingRelationStatus = {
  PROSPECT: "PROSPECT",
  CONTACTED: "CONTACTED",
  MATERIAL_PLACED: "MATERIAL_PLACED",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  ENDED: "ENDED",
} as const satisfies Record<string, LodgingRelationStatus>;

export type LodgingCollabModality =
  | "PRESENCE_RECOMMEND"
  | "WELCOME_BASKET"
  | "COMMISSION_SALE"
  | "NIGHT_PACK";

export const LodgingCollabModality = {
  PRESENCE_RECOMMEND: "PRESENCE_RECOMMEND",
  WELCOME_BASKET: "WELCOME_BASKET",
  COMMISSION_SALE: "COMMISSION_SALE",
  NIGHT_PACK: "NIGHT_PACK",
} as const satisfies Record<string, LodgingCollabModality>;

export type LodgingWelcomeMode = "SPECIAL_PRICE" | "CONSIGNMENT";

export const LodgingWelcomeMode = {
  SPECIAL_PRICE: "SPECIAL_PRICE",
  CONSIGNMENT: "CONSIGNMENT",
} as const satisfies Record<string, LodgingWelcomeMode>;

export type LodgingRelationEventType =
  | "CONTACT"
  | "MATERIAL"
  | "REFERRAL"
  | "BASKET"
  | "THANK_YOU_GIFT"
  | "COMMISSION"
  | "AGREEMENT"
  | "NOTE"
  | "STATUS_CHANGE";

export const LodgingRelationEventType = {
  CONTACT: "CONTACT",
  MATERIAL: "MATERIAL",
  REFERRAL: "REFERRAL",
  BASKET: "BASKET",
  THANK_YOU_GIFT: "THANK_YOU_GIFT",
  COMMISSION: "COMMISSION",
  AGREEMENT: "AGREEMENT",
  NOTE: "NOTE",
  STATUS_CHANGE: "STATUS_CHANGE",
} as const satisfies Record<string, LodgingRelationEventType>;

export {
  calculateStackedCommission,
  classifySlNetMargin,
  referenceBasketMarginTable,
  PRODUCER_TIER_COMMISSION_PERCENT,
  REFERENCE_BASKET_PVP,
} from "./commission-stack.js";
export type {
  MarginDecision,
  ProducerTierKey,
  StackedCommissionBreakdown,
  StackedCommissionInput,
} from "./commission-stack.js";
