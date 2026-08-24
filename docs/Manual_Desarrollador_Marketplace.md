# Manual de Desarrollador — Marketplace Villardeciervos

![Logo Sabores de la Culebra](./imagenes/logo.png)

**Documentos relacionados:** [Requisitos / UC / UML](./Requisitos_Funcionales_NoFuncionales_UseCases_UML.md) · [Turismo](./tourism.md) · [Base de datos](./database.md) · [Catálogo](./catalog.md)

---

## B. Manual de Desarrollador

### B1. Estructura del monorepo

- `apps/web`: frontend Next.js + rutas server (cron, webhook, admin).
- `packages/auth`: lógica de negocio (checkout, pagos, emails, shipping, reviews, payouts, etc.).
- `packages/db`: Prisma schema, migrations y `seed.ts`.

### B2. Configuración local (imprescindible)

Archivo `.env` en la raíz (monorepo), con:

- `DATABASE_URL`
- `AUTH_SECRET`
- variables de email (`EMAIL_PROVIDER`, `EMAIL_FROM`, `EMAIL_PROVIDER_API_KEY`)
- `CRON_SECRET` (protege endpoints tipo cron)
- variables stripe (si se desea probar Stripe real; en dev puede usarse sandbox).

> Recomendación: usar las credenciales y secrets correctos para que Next/NextAuth/Auth.js carguen el entorno.

### B3. Ejecutar y preparar entorno

1. Migraciones y seed:
   - `npm run db:seed`
2. Generar cliente Prisma si hiciera falta:
   - se hace con `prisma migrate dev` / `prisma generate` durante el ciclo de desarrollo.
3. Desplegar/levantar:
   - `npm run dev:web` (frontend Next.js, puerto 3000)
   - `npm run dev:api` (API REST Fastify, puerto 4000)

Documentacion interactiva de la API REST (Swagger UI): `http://localhost:4000/docs`  
Especificacion OpenAPI: `apps/api/src/openapi/spec.ts` — activada por defecto en desarrollo (`ENABLE_SWAGGER=true`).

### B4. Stripe Connect, retención 14 días y payouts

Flujo implementado (alto nivel):

- Tras pago confirmado (`checkout.session.completed` / `payment_intent.succeeded`) el sistema marca el pedido como pagado (`markOrderPaid`).
- Al marcar el pedido como pagado, se crean payouts para cada `VendorOrder`, quedando:
  - `heldForWithdrawal=true`
  - `releasesAt = now + 14 días`
- Liberación en producción:
  - cron `releaseMaturedPayouts` (`/api/cron/release-payouts`) cuando `releasesAt` ha vencido.
- Liberación en sandbox admin:
  1. asociar un `stripePaymentIntentId` sintético al `Payment`,
  2. `markOrderPaid({ orderNumber, paymentIntentId })`,
  3. opcionalmente adelantar `releasesAt` (fast-forward),
  4. marcar payout `PAID` sin llamar a Stripe.

**Importante (`markOrderPaid`):** si se pasa `paymentIntentId` que aún no está en BD, la función hace fallback por `orderNumber`. El sandbox primero hace `payment.updateMany` con el PI sintético y después llama a `markOrderPaid` (mismo patrón que el webhook).

Archivos clave:

- `packages/auth/src/payment.service.ts`
- `apps/web/src/app/admin/sandbox/actions.ts`
- `apps/web/src/app/api/cron/release-payouts/route.ts`
- `apps/web/src/app/api/stripe/webhook/route.ts`

### B5. Emails y notificaciones

Templates y envío (`packages/auth/src/email.service.ts`):

| Evento | Destinatario | Función |
|--------|--------------|---------|
| Checkout / pedido creado | Comprador | `sendOrderConfirmationEmail` |
| Checkout | Cada artesano del pedido | `sendVendorNewOrderEmail` |
| Marca envío (`SHIPPED`) | Comprador | `sendShipmentNotificationEmail` |

En desarrollo sin proveedor SMTP, los emails se imprimen en consola: `[EMAIL] To: … | Subject: …`.

Telegram (best-effort, `notifications.service.ts`):

- `notifyCheckout` tras checkout
- `notifyPaymentConfirmed` tras `markOrderPaid`

### B6. Documentos PDF (pedidos y cambios de producto)

Generación bajo demanda con **pdfkit** en `apps/web` (no en el paquete auth compilado).

Archivos clave:

| Capa | Archivo |
|------|---------|
| Cabecera común | `apps/web/src/lib/pdf-document-header.ts` |
| PDF pedidos | `apps/web/src/lib/order-document.ts` |
| PDF cambios | `apps/web/src/lib/product-change-document.ts` |
| Registros / retención | `packages/auth/src/stored-document.service.ts` |
| UI descarga | `apps/web/src/components/orders/download-order-document-button.tsx` |

API routes:

- `GET /api/orders/[orderNumber]/document`
- `GET /api/vendor-orders/[id]/document`
- `GET /api/admin/orders/[orderNumber]/document`
- `GET /api/stored-documents/[id]/document`
- `GET /api/cron/purge-documents` (limpieza, Bearer `CRON_SECRET`)

Configuración:

- Variables `MARKETPLACE_*` en `.env` (nombre, datos fiscales). Logo web/packaging: `public/logo.png` (mosaico). Logo documentos PDF: `public/logo1.png` (escudo).
- `serverExternalPackages: ["pdfkit", "fontkit"]` en `next.config.ts`.
- Recompilar auth tras cambios: `npm run build --workspace @culebra/auth`.

Documentación completa: [documents.md](./documents.md).

### B7. Reviews post-compra (server action)

Flujo:

- En `.../pedido/[orderNumber]/review-actions.ts` hay un server action con:
  - validación de sesión,
  - verificación de pertenencia al pedido,
  - validación de que el producto está en el pedido,
  - prevención de duplicidad.

### B8. Admin: KPIs, rentabilidad, rappels, piloto, sandbox, plan y turismo

| Ruta | Código |
|------|--------|
| KPIs | `apps/web/src/app/admin/kpis/page.tsx` |
| Rentabilidad | `apps/web/src/app/admin/rentabilidad/page.tsx` |
| Rappels | `apps/web/src/app/admin/rappels/page.tsx`, `actions.ts`, `lib/rappels.ts` |
| Plan + simulador | `apps/web/src/app/admin/plan/*`, `lib/financial-simulation.ts`, `components/admin/plan-simulator.tsx` |
| Comparativa 15 % vs 17 % | [`docs/Comparativa_Comision_15_vs_17.md`](../../docs/Comparativa_Comision_15_vs_17.md) · `compareCommissionRates()` |
| Sensibilidad de costes | [`docs/Sensibilidad_Costes_Plan_Viabilidad.md`](../../docs/Sensibilidad_Costes_Plan_Viabilidad.md) · `sensitivityFixedCosts()` etc. |
| Flujo de caja | [`docs/Flujo_Caja_Plan_Viabilidad.md`](../../docs/Flujo_Caja_Plan_Viabilidad.md) · `runCashFlowModel()`, `sensitivitySubsidyTiming()` |
| Sensibilidad retrasos | [`docs/Sensibilidad_Retrasos_Plan_Viabilidad.md`](../../docs/Sensibilidad_Retrasos_Plan_Viabilidad.md) · `sensitivitySubsidyDelay()` etc. |
| Plan contingencia tesorería | [`docs/Plan_Contingencia_Tesoreria.md`](../../docs/Plan_Contingencia_Tesoreria.md) · `resolveCashAlertLevel()`, `CONTINGENCY_SCENARIOS` |
| Piloto | `apps/web/src/app/admin/piloto/*` |
| Argumentario captación productores | [`docs/Argumentario_Captacion_Productores.md`](../../docs/Argumentario_Captacion_Productores.md) · materiales [`Materiales_Presentacion_Captacion.md`](../../docs/Materiales_Presentacion_Captacion.md) |
| Estrategia captación productores | [`docs/Estrategia_Captacion_Productores.md`](../../docs/Estrategia_Captacion_Productores.md) |
| Resumen ejecutivo socios | [`docs/Resumen_Ejecutivo_Socios.md`](../../docs/Resumen_Ejecutivo_Socios.md) |
| Concepto tienda / showroom | [`docs/Concepto_Tienda_Showroom_Villardeciervos.md`](../../docs/Concepto_Tienda_Showroom_Villardeciervos.md) |
| Sandbox | `apps/web/src/app/admin/sandbox/*` |
| Turismo | `apps/web/src/app/admin/turismo/*` |

#### B8.1 Grupo piloto — Server vs Client

- `page.tsx` es **Server Component** (puede exportar `metadata` y cargar datos con Prisma).
- `pilot-board.tsx` / `pilot-workspace.tsx` son Client Components.
- Las constantes de estado/fase viven en `pilot-constants.ts`.
- **Categorías:** modelo `PilotCategory` (CRUD admin persistente). UI: `pilot-category-manager.tsx`. Acciones: `createPilotCategory` / `updatePilotCategory` / `deletePilotCategory` (soft-delete si hay productores usando el nombre).
- Seed inicial: agro (miel, embutidos, queso, vinos, conservas, repostería, aceites) + hostelería (restaurantes, casas rurales, hoteles, bares, catering, turismo activo).
- **Ficha de propuesta de valor:** modelo `PilotValueProposition`, ruta `/admin/piloto/[id]/propuesta` (editor + `?print=1`).
- Hoja de ruta Mes 2–6: `pilot-roadmap.ts` + filtro en `pilot-workspace.tsx`.
- **No** importar constantes desde `page.tsx` hacia un Client Component: Next trataría la página como client y fallaría el export de `metadata`.

#### B8.2 Sandbox — acciones y redirect con feedback

Server actions en `apps/web/src/app/admin/sandbox/actions.ts`:

| Acción | Query de éxito | Notas |
|--------|----------------|-------|
| `createSandboxOrder` | `?created=` | Requiere seed consumer + producto PUBLISHED con stock |
| `simulatePaymentOk` | `?paid=` | Asocia PI sandbox + `markOrderPaid` |
| `simulateConfirmAndShip` | `?shipped=` | `PENDING`→`CONFIRMED`→`SHIPPED` |
| `simulateFastForwardRetention` | `?retention=` | Solo mueve `releasesAt` al pasado |
| `simulateReleasePayouts` | `?released=` | Marca payout `PAID` sin Stripe |
| `simulateDeliver` | `?delivered=` | Solo líneas en `SHIPPED` |

UI:

- Botones con `useFormStatus` (`sandbox-submit-button.tsx`).
- Banners según `searchParams`.
- «Marcar entregado» habilitado si `any(vo.status === "SHIPPED")` (no si ya están todos `DELIVERED`).

Tras cambios en `packages/auth`, recompilar: `npm run build --workspace @culebra/auth` (Next resuelve `@culebra/auth` a `dist/`).

#### B8.3 Rappels — liquidación anual (`RappelSettlement`)

Política Opción A (retroactiva): durante el año se cobra siempre el 17 %; al cierre del año natural se congela el abono.

| Pieza | Ubicación |
|-------|-----------|
| Tramos + cálculo | `apps/web/src/lib/rappels.ts` |
| Cerrar año / marcar abonado | `apps/web/src/app/admin/rappels/actions.ts` |
| UI admin | `/admin/rappels` |
| Vista productor | `/panel/proveedor/liquidaciones` |
| Modelo | `RappelSettlement` + enums `RappelSettlementStatus`, `RappelPaymentMethod` |
| Migración | `packages/db/prisma/migrations/20260821120000_rappel_settlements` |

Flujo:

1. Proyección en vivo (pedidos no `CANCELLED`/`RETURNED`) — no crea deuda.
2. **Cerrar año** → `createMany` de liquidaciones con `rebateAmount > 0`, estado `PENDING`, `dueAt` ≈ 1 de marzo (+60 días).
3. Importe = facturación neta × % tramo (Plata 3 % / Oro 5 %).
4. Admin marca `PAID` (`TRANSFER` o `PAYOUT_OFFSET`) o `CANCELLED`.

Ver `docs/commissions.md` y `docs/Clausula_Comision_Rappels_Productor.md`.

### B8b. Turismo territorial (fases 2–3) — diseño

**Principio:** el checkout (`checkoutCart`) solo procesa **líneas de producto**. La noche de alojamiento **nunca** entra en el carrito; se enlaza a Booking / web / WhatsApp / teléfono.

| Fase | Qué | Rutas / modelos |
|------|-----|-----------------|
| 2 | Directorio + cross-sell | `Accommodation`, `/alojamientos`, `/tienda` |
| 3 | Packs, cupones, afiliación | `TourismPack`, `Coupon`, `AffiliateCode`, `/packs`, cookie `culebra_ref` |

Servicios (`packages/auth`):

- `accommodation.service.ts` / `tourism-pack.service.ts`
- `coupon.service.ts` / `affiliate.service.ts`
- Carrito: `applyCartCoupon`, `addPackToCart`; checkout aplica `discountAmount`, `couponCode`, `affiliateCode`

Migración: `packages/db/prisma/migrations/20260820130000_tourism_module/`

Hub UX: `/tienda` (agro + entradas turismo). `/categorias` (índice) redirige a `/tienda`.

### B8c. Envío con umbral gratuito

Regla en `packages/auth/src/shipping.service.ts` (`computeShippingQuote`):

- Merchandise &gt; 0 → cliente paga **6,50 €** (`Order.shippingAmount`); no hay envío gratis
- La S.L. no absorbe portes; comisión por defecto **17 %** (mínimo **4 €** por subpedido)

Constantes: `@culebra/domain` (`CUSTOMER_SHIPPING_FEE_EUR = 6.5`, `DEFAULT_MARKETPLACE_COMMISSION_PERCENT = 17`, `DEFAULT_MIN_COMMISSION_EUR = 4`).

Migración: `20260820140000_order_shipping_amount`.

### B9. Diagramas y modelado

Para cambios en BD o lógica:

- Prisma Schema en `packages/db/prisma/schema.prisma`
- Recomendado: actualizar migración y revisar side-effects en:
  - `payment.service.ts`
  - `order.service.ts`
  - paneles admin que calculan métricas.

### B10. Flujo VENDOR: creación de producto y publicación por ADMIN

#### B9.1. Objetivo
Permitir que un **proveedor (VENDOR)** cree productos, pero que el catálogo público solo muestre productos cuando un **admin** los haya revisado y publicado.

#### B9.2. Rutas implicadas (frontend)
- Alta/edición en panel VENDOR:
  - `/panel/proveedor/productos/nuevo` (crear)
  - `/panel/proveedor/productos/[id]` (editar)
- Envío a revisión:
  - botón **“Enviar a revisión”** (solo aparece si el producto está en `DRAFT` o `REJECTED`)
- Contrato requerido:
  - `/panel/proveedor/contratos`

#### B9.3. En el backend (lógica de negocio)
El envío a revisión ejecuta `submitProductForReview` en el servicio de `packages/auth`.
Si el proveedor **no tiene contrato activo**, el sistema corta el flujo con el error:
- `VENDOR_CONTRACT_REQUIRED`

El estado “publicable” depende de que el producto termine en `PUBLISHED` (solo entonces entra en el catálogo público `/productos`).

#### B9.4. Cómo se resuelve cuando falla por contrato
En el panel de VENDOR, si aparece el mensaje “no tienes un contrato activo”, significa que:
- no existe `pendingVersion` que puedas aceptar,
- por lo tanto el admin debe crear/enviar a firma una versión del contrato para tu productor.

Una vez que el admin la envíe a firma y a ti te aparezca `pendingVersion`, podrás aceptar el contrato desde:
- `/panel/proveedor/contratos`

Después de tener contrato activo, el botón **“Enviar a revisión”** vuelve a funcionar y el admin ya puede revisar/publicar.

### B10. Imágenes de producto (upload, placeholders y Next Image)

#### B10.1. Requisito
Si un productor no sube foto, el sistema muestra un **PNG por defecto** según la categoría (incluye “Reposteria”).

#### B10.2. Upload y almacenamiento
- API: `POST /api/upload/product-image` → guarda en `apps/web/public/uploads/products/` y devuelve ruta relativa `/uploads/products/<uuid>.ext`.
- El schema de producto acepta URL absoluta **o** ruta relativa que empiece por `/uploads/` (`productImageInputSchema`).
- Al guardar el formulario se persiste la ruta **relativa** (no se fuerza `NEXT_PUBLIC_APP_URL`), para que funcione si Next arranca en `:3001` u otro puerto.

#### B10.3. Visualización
- `toPublicImageSrc()` (`apps/web/src/lib/product-image.ts`) convierte URLs absolutas `localhost` de uploads a path relativo.
- `getProductImage()` en `product-card.tsx` usa esa normalización.
- Miniaturas de uploads usan `unoptimized` en `next/image` para evitar timeouts del optimizador en local.
- `next.config.ts` admite `remotePatterns` para `localhost`/`127.0.0.1` en puertos 3000–3010 (por si quedan URLs absolutas antiguas en BD).

#### B10.4. Placeholders
- PNG en `apps/web/public/categories/`.
- Categoría “Reposteria” en `seed.ts`.
- Mapa slug → imagen en `product-card.tsx`.

