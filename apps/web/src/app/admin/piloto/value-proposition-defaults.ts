/** Textos por defecto para la ficha de propuesta de valor (programa fundadores). */

export function defaultValueProposition(input: {
  producerName: string;
  category: string;
  location?: string | null;
}) {
  const where = input.location?.trim()
    ? `en ${input.location.trim()}`
    : "en la Sierra de la Culebra y su área de influencia";

  return {
    headline: `${input.producerName}: tú haces el producto; nosotros te ayudamos a venderlo`,
    context: [
      `${input.producerName} elabora ${input.category.toLowerCase()} ${where}.`,
      "Sabores de la Culebra ofrece un canal comercial compartido: escaparate físico en Villardeciervos, venta online conjunta y pedidos de varios productores en un solo envío.",
      "No sustituimos vuestros canales actuales: añadimos uno. El stock sigue siendo vuestro (no compramos mercancía). Empezamos con poco; si funciona, ampliamos.",
    ].join("\n\n"),
    benefits: [
      "Otro lugar donde vender, sin montar ni mantener otra tienda completa.",
      "Escaparate físico + confianza territorial (Villardeciervos).",
      "Cesta multiproductor: vuestro producto se beneficia de la compra conjunta.",
      "Pagos seguros (Stripe / PayPal) y liquidaciones trazables.",
      "Consolidación logística y apoyo operativo desde la trastienda.",
      "Prueba reversible: dos referencias, poco stock, sin exclusividad.",
    ].join("\n"),
    offerTerms: [
      "Sin exclusividad: canal adicional a los que ya uséis.",
      "Vosotros fijáis el PVP; la plataforma aplica la comisión acordada por contrato.",
      "Comisión estándar 17 % (mín. 4 €/subpedido) + rappels por volumen en años siguientes.",
      "Condiciones Fundadores (piloto, si aplica): 12 % fijo el primer año — detalle en hoja de condiciones / contrato; no es el gancho del primer contacto.",
      "Retención legal del payout: 14 días; después se libera al productor.",
      "Envío al cliente: tarifa plana a cargo del comprador (importe vigente en /admin/config).",
      "Preparación SLA: objetivo 24 h hábiles para no perecederos.",
    ].join("\n"),
    productMix: [
      `Categoría de entrada: ${input.category}.`,
      "Arranque recomendado: 2 referencias (ampliar si hay rotación).",
      "Priorizar no perecederos / buena conservación; fichas claras (origen, peso, alérgenos, fechas).",
    ].join("\n"),
    nextSteps: [
      "1. Revisar juntos esta ficha y elegir las dos referencias de prueba.",
      "2. Firmar NDA si se comparte información sensible.",
      "3. Contrato de adhesión + alta de cobros (Stripe Connect o PayPal).",
      "4. Fotos y fichas (ayuda del programa fundadores si aplica).",
      "5. Pedido / rotación de prueba; medir ventas; decidir si ampliar.",
    ].join("\n"),
    preparedBy: "Socio 2 (Comercial)",
    status: "DRAFT" as const,
  };
}

export const VALUE_PROP_TASK_TITLE = "Preparar ficha de propuesta de valor";
