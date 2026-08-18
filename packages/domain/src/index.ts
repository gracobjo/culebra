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
