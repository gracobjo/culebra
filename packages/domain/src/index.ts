export type UserRole = "ADMIN" | "VENDOR" | "CONSUMER";

export type ProductStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "DISABLED";

export type PaymentStatus =
  | "PAYMENT_PENDING"
  | "PAYMENT_AUTHORIZED"
  | "PAYMENT_PAID"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_PARTIALLY_REFUNDED";
