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
