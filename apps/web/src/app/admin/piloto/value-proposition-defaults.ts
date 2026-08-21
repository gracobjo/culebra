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
    headline: `${input.producerName}: vender sin montar tu propia tienda online`,
    context: [
      `${input.producerName} elabora ${input.category.toLowerCase()} ${where}.`,
      "El marketplace Sabores de la Culebra canaliza demanda nacional (tarjeta, wallets y Bizum) sin que el artesano construya ni mantenga una tienda completa.",
      "El stock sigue siendo vuestro: la plataforma no compra mercancía; solo intermedia pedidos, pagos y liquidaciones.",
    ].join("\n\n"),
    benefits: [
      "Coste de entrada cero (sin cuota de alta).",
      "Catálogo digital con vuestra marca e identidad.",
      "Pagos seguros (Stripe) y seguimiento de pedidos.",
      "Consolidación logística y apoyo operativo desde Villardeciervos (objetivo del programa).",
      "Contrato y comisión versionados, con trazabilidad.",
      "Promoción conjunta del territorio (efecto llamada del grupo piloto).",
    ].join("\n"),
    offerTerms: [
      "Condiciones Fundadores (primer año): comisión marketplace 12 % (vs. 17 % estándar).",
      "Retención legal del payout: 14 días (derecho de desistimiento); después se libera al productor.",
      "Envío al cliente: tarifa plana 6,50 € siempre a cargo del comprador.",
      "El productor prepara el pedido en plazos SLA (objetivo: 24 h hábiles para no perecederos).",
      "Tras el piloto, se puede revisar la comisión según volumen (rappels / tramos contractuales).",
    ].join("\n"),
    productMix: [
      `Categoría de entrada: ${input.category}.`,
      "Priorizar productos de larga conservación / no perecederos para el arranque.",
      "3–8 referencias iniciales bien fotografiadas y con ficha clara (origen, peso, alérgenos, conservación).",
    ].join("\n"),
    nextSteps: [
      "1. Revisar juntos esta ficha y ajustar productos / precios.",
      "2. Firmar NDA si se comparte información sensible.",
      "3. Firma de contrato de adhesión + alta Stripe Connect (o PayPal como alternativa de liquidación).",
      "4. Sesión de fotografía y redacción de fichas.",
      "5. Pedido de prueba (sandbox / beta) antes del lanzamiento público.",
    ].join("\n"),
    preparedBy: "Socio 2 (Comercial)",
    status: "DRAFT" as const,
  };
}

export const VALUE_PROP_TASK_TITLE = "Preparar ficha de propuesta de valor";
