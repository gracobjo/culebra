import type { FaqEntry, FaqMatch } from "./types";

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "que-es",
    question: "¿Qué es Sabores de la Culebra?",
    answer:
      "Sabores de la Culebra es un marketplace de productos tradicionales y agroalimentarios de la Sierra de la Culebra (Zamora). Puedes comprar directamente a productores y artesanos locales desde un único catálogo.",
    keywords: ["marketplace", "sierra", "culebra", "villardeciervos", "que es", "qué es"],
  },
  {
    id: "como-comprar",
    question: "¿Cómo compro un producto?",
    answer:
      "Explora el catálogo en /productos, añade artículos al carrito y finaliza el checkout. Puedes pagar con tarjeta, Bizum o wallets (Google Pay / Apple Pay). Tras el pago recibirás confirmación y podrás seguir el pedido en /cuenta/pedidos o en /pedido/[número].",
    keywords: ["comprar", "compra", "carrito", "checkout", "pagar", "pedido"],
  },
  {
    id: "pagos",
    question: "¿Qué métodos de pago aceptáis?",
    answer:
      "Aceptamos tarjeta bancaria (Visa, Mastercard, Amex), Bizum y wallets digitales cuando el dispositivo los tenga configurados. Los pagos se procesan de forma segura con Stripe.",
    keywords: ["pago", "tarjeta", "bizum", "stripe", "visa", "mastercard", "apple pay", "google pay"],
  },
  {
    id: "envio",
    question: "¿Cómo funciona el envío?",
    answer:
      "El envío es tarifa plana a cargo del cliente (sin umbral de envío gratis). Puedes comprar a varios productores en un solo pedido; consolidamos cuando procede. Cuando el pedido se marca como enviado recibirás seguimiento si el productor indica transportista y tracking.",
    keywords: ["envio", "envío", "transporte", "seguimiento", "tracking", "entrega", "recibir", "tarifa", "porte"],
  },
  {
    id: "conservacion",
    question: "¿Los productos necesitan nevera? ¿Cuánto duran?",
    answer:
      "El surtido de arranque está pensado para ir sin refrigeración (trastienda de paquetería limpia). Aun así, algunos formatos tienen consumo preferente corto: repostería seca tipo soles de Aliste o rosquillas suele etiquetarse en 30–60 días; loncheados de caza o tacos de chorizo, 60–90 días; harina de castaña y mermeladas bajas en azúcar, en torno a 90 días. La pieza entera de embutido, la miel o el vino aguantan más. Cada ficha muestra la fecha del productor.",
    keywords: [
      "nevera",
      "frio",
      "frío",
      "caducidad",
      "consumo preferente",
      "soles",
      "aliste",
      "loncheado",
      "castaña",
      "mermelada",
      "conservacion",
      "conservación",
    ],
  },
  {
    id: "devoluciones",
    question: "¿Puedo devolver un pedido?",
    answer:
      "Como consumidor tienes derecho de desistimiento de 14 días naturales desde la recepción, salvo excepciones legales en productos perecederos abiertos. Durante ese periodo los fondos permanecen retenidos hasta confirmar la entrega o resolver una devolución. Contacta con nosotros desde tu pedido o por email del marketplace.",
    keywords: ["devolucion", "devolución", "desistimiento", "reembolso", "devolver", "cancelar"],
  },
  {
    id: "multi-proveedor",
    question: "¿Puedo mezclar productos de varios productores?",
    answer:
      "Sí. El carrito admite productos de distintos artesanos en un mismo pedido. Cada productor recibe su subpedido y lo gestiona de forma independiente (preparación, envío y liquidación).",
    keywords: ["varios", "productores", "artesanos", "multi", "proveedor", "mezclar"],
  },
  {
    id: "cuenta",
    question: "¿Necesito cuenta para comprar?",
    answer:
      "Puedes registrarte en /register para guardar tus pedidos en /cuenta. También puedes consultar un pedido concreto en /pedido/[número] si dispones del número de pedido.",
    keywords: ["cuenta", "registro", "login", "sesion", "sesión", "usuario"],
  },
  {
    id: "productor-alta",
    question: "¿Cómo me doy de alta como productor?",
    answer:
      "Solicita acceso como vendedor desde el formulario de registro de productor. Una vez aprobado, accederás al panel en /panel/proveedor para crear productos, gestionar pedidos y liquidaciones. Necesitarás un contrato activo antes de publicar productos.",
    keywords: ["productor", "vendedor", "artesano", "alta", "vender", "panel proveedor", "contrato"],
  },
  {
    id: "estado-pedido",
    question: "¿Cómo consulto el estado de mi pedido?",
    answer:
      "Si iniciaste sesión, entra en /cuenta/pedidos. También puedes abrir /pedido/[número] con el número que recibiste por email. Los estados habituales son: pendiente de pago, pagado, en preparación, enviado y entregado.",
    keywords: ["estado", "seguimiento", "donde esta", "dónde está", "pedido", "tracking"],
  },
  {
    id: "precios-iva",
    question: "¿Los precios incluyen IVA?",
    answer:
      "Los precios mostrados en el catálogo son PVP con la información fiscal del producto. En el checkout verás el desglose antes de confirmar el pago.",
    keywords: ["iva", "precio", "pvp", "impuestos", "euros"],
  },
  {
    id: "categorias",
    question: "¿Qué categorías hay?",
    answer:
      "Puedes explorar todas las categorías en /categorias: embutidos, quesos, miel, conservas y otros productos locales. Usa los filtros en /productos para acotar por categoría o productor.",
    keywords: ["categorias", "categorías", "embutidos", "quesos", "miel", "catalogo", "catálogo"],
  },
  {
    id: "contacto",
    question: "¿Cómo contacto con el marketplace?",
    answer:
      "Puedes escribir al email de contacto del marketplace (si está configurado) o usar este asistente para dudas frecuentes. Para incidencias de un pedido concreto, indica siempre el número de pedido.",
    keywords: ["contacto", "email", "ayuda", "soporte", "telefono", "teléfono"],
  },
];

const STOP_WORDS = new Set([
  "a",
  "al",
  "como",
  "cómo",
  "con",
  "de",
  "del",
  "el",
  "en",
  "es",
  "la",
  "las",
  "lo",
  "los",
  "me",
  "mi",
  "o",
  "para",
  "por",
  "que",
  "qué",
  "se",
  "si",
  "sí",
  "tu",
  "un",
  "una",
  "y",
]);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function searchFaq(query: string, limit = 3): FaqMatch[] {
  const tokens = tokenize(query);
  if (!tokens.length) {
    return [];
  }

  const scored = FAQ_ENTRIES.map((entry) => {
    const haystack = normalizeText(
      [entry.question, entry.answer, ...entry.keywords].join(" "),
    );
    let score = 0;

    for (const token of tokens) {
      if (haystack.includes(token)) {
        score += 2;
      }
      for (const keyword of entry.keywords) {
        if (normalizeText(keyword).includes(token)) {
          score += 3;
        }
      }
    }

    const normalizedQuery = normalizeText(query);
    if (normalizeText(entry.question).includes(normalizedQuery)) {
      score += 5;
    }

    return {
      id: entry.id,
      question: entry.question,
      answer: entry.answer,
      score,
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

export function formatFaqContext(matches: FaqMatch[]): string {
  if (!matches.length) {
    return "";
  }

  return matches
    .map((match, index) => `${index + 1}. ${match.question}\n${match.answer}`)
    .join("\n\n");
}
