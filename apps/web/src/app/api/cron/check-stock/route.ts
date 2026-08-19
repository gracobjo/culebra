import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@culebra/db";

const STOCK_LOW_THRESHOLD = 5;

async function sendTelegramToAdmin(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
    });
  } catch {
    // best-effort
  }
}

async function sendStockEmail(to: string, subject: string, html: string, text?: string) {
  const provider = (process.env.EMAIL_PROVIDER ?? "").toLowerCase();
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const from = process.env.EMAIL_FROM ?? "no-reply@culebra.local";

  if (!apiKey || apiKey.includes("REEMPLAZAR") || !provider) {
    // Dev: no bloquear, solo log.
    console.log(`[STOCK EMAIL] To: ${to} | Subject: ${subject}`);
    if (process.env.NODE_ENV !== "production") {
      console.log(`[STOCK EMAIL BODY]\n${text ?? html}`);
    }
    return;
  }

  if (provider === "resend") {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend error ${res.status}: ${body}`);
    }
    return;
  }

  if (provider === "sendgrid") {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: from },
        personalizations: [{ to: [{ email: to }] }],
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });
    if (!res.ok && res.status !== 202) {
      const body = await res.text();
      throw new Error(`SendGrid error ${res.status}: ${body}`);
    }
    return;
  }

  // Otros providers no soportados: best-effort sin romper cron.
  console.warn(`[STOCK EMAIL] Provider "${provider}" no soportado.`);
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Inventario por producto/variante. Avisamos cuando el stock agregado del producto
    // (calculado sumando filas de inventory) queda en <= 5.
    const rows = await prisma.inventory.findMany({
      where: {
        vendor: { status: "ACTIVE", deletedAt: null },
        product: { status: "PUBLISHED", deletedAt: null },
      },
      include: {
        vendor: {
          select: {
            id: true,
            tradeName: true,
            email: true,
            user: { select: { email: true } },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: { select: { name: true } },
            subcategory: { select: { name: true } },
          },
        },
      },
    });

    // Agrupar por vendor: sumamos stock por producto.
    const byVendor = new Map<
      string,
      {
        vendorId: string;
        vendorTradeName: string;
        vendorEmail: string | null;
        products: Array<{
          productId: string;
          productName: string;
          productSlug: string;
          label: string;
          stockSum: number;
        }>;
      }
    >();

    const stockByVendorProduct = new Map<string, number>(); // `${vendorId}:${productId}` -> stockSum
    const labelByVendorProduct = new Map<
      string,
      { productName: string; productSlug: string; label: string }
    >();

    for (const row of rows) {
      const vendorId = row.vendorId;
      const productId = row.productId;
      const key = `${vendorId}:${productId}`;

      stockByVendorProduct.set(key, (stockByVendorProduct.get(key) ?? 0) + row.stock);

      const categoryName = row.product.category?.name;
      const subcategoryName = row.product.subcategory?.name;
      const label = subcategoryName ? `${categoryName ?? ""} / ${subcategoryName}`.trim() : categoryName ?? "";

      labelByVendorProduct.set(key, {
        productName: row.product.name,
        productSlug: row.product.slug,
        label,
      });
    }

    for (const [key, stockSum] of stockByVendorProduct.entries()) {
      const [vendorId, productId] = key.split(":");
      const rowLabel = labelByVendorProduct.get(key);
      if (!rowLabel) continue;

      const vendor = byVendor.get(vendorId) ?? null;
      if (!vendor) {
        // Recuperar vendor desde una de las filas originales (best-effort).
        const firstRow = rows.find((r) => r.vendorId === vendorId && `${r.productId}` === productId);
        if (!firstRow) continue;

        byVendor.set(vendorId, {
          vendorId,
          vendorTradeName: firstRow.vendor.tradeName,
          vendorEmail: firstRow.vendor.email ?? firstRow.vendor.user.email ?? null,
          products: [],
        });
      }

      const next = byVendor.get(vendorId)!;
      next.products.push({
        productId,
        productName: rowLabel.productName,
        productSlug: rowLabel.productSlug,
        label: rowLabel.label,
        stockSum,
      });
    }

    // Filtrar por <= 5 agregado.
    for (const v of byVendor.values()) {
      v.products = v.products.filter((p) => p.stockSum <= STOCK_LOW_THRESHOLD).sort((a, b) => a.stockSum - b.stockSum);
    }

    if (byVendor.size === 0) {
      return NextResponse.json({ ok: true, alerted: 0 });
    }

    const now = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

    const telegramLines: string[] = [
      `⚠️ *Stock “va a agotarse” (<= ${STOCK_LOW_THRESHOLD})*`,
      `⏰ ${now}`,
      ``,
    ];

    for (const vendor of Array.from(byVendor.values())) {
      const productsText =
        vendor.products
          .map((p) => `- ${p.productName} (${p.stockSum} uds)`)
          .join("\n") || "- (sin detalle)";

      telegramLines.push(`🏭 ${vendor.vendorTradeName}\n${productsText}\n`);

      // Email al proveedor (si hay email).
      if (vendor.vendorEmail && vendor.products.length > 0) {
        const rowsHtml = vendor.products
          .map(
            (p) =>
              `<tr><td>${p.productName}</td><td>${p.label ? `<span style="color:#555">${p.label}</span><br/>` : ""}${p.stockSum}</td></tr>`,
          )
          .join("");

        const html = `
          <div style="font-family:system-ui,Arial,sans-serif;max-width:680px;margin:0 auto;">
            <h2 style="color:#065f46;">Stock bajo en tu catálogo</h2>
            <p>Hola ${vendor.vendorTradeName},</p>
            <p>Detectamos que tus productos están cerca de agotarse (stock <= ${STOCK_LOW_THRESHOLD}).</p>
            <table style="width:100%;border-collapse:collapse;margin-top:12px;">
              <thead>
                <tr>
                  <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:8px 0;">Producto</th>
                  <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:8px 0;">Stock</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
            <p style="margin-top:16px;color:#6b7280;font-size:13px;">Este email es generado automáticamente.</p>
          </div>
        `;

        const text = `Stock bajo (<= ${STOCK_LOW_THRESHOLD})\n- ${vendor.products
          .map((p) => `${p.productName}: ${p.stockSum}`)
          .join("\n- ")}`;

        await sendStockEmail(
          vendor.vendorEmail,
          `Stock bajo (<= ${STOCK_LOW_THRESHOLD}) · ${vendor.vendorTradeName}`,
          html,
          text,
        );
      }
    }

    await sendTelegramToAdmin(telegramLines.join("\n").slice(0, 3500));

    return NextResponse.json({
      ok: true,
      alerted: byVendor.size,
      threshold: STOCK_LOW_THRESHOLD,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

