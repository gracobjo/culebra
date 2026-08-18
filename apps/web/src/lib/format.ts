export function formatPrice(value: string | number): string {
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) {
    return value.toString();
  }
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export const productStatusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "Pendiente de revision",
  PUBLISHED: "Publicado",
  REJECTED: "Rechazado",
  DISABLED: "Desactivado",
};

export const orderStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAYMENT_PENDING: "Pendiente de pago",
  PAID: "Pagado",
  PARTIALLY_SHIPPED: "Envio parcial",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const vendorOrderStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  IN_PREPARATION: "En preparacion",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  RETURNED: "Devuelto",
};

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
