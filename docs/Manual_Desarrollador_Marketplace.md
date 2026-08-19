# Manual de Desarrollador — Marketplace Villardeciervos

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)


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
   - `npm run dev` (workspace web).

### B4. Stripe Connect, retención 14 días y payouts

Flujo implementado (alto nivel):

- Tras pago confirmado (`checkout.session.completed` / `payment_intent.succeeded`) el sistema marca el pedido como pagado.
- Al marcar el pedido como pagado, se crean payouts para cada `VendorOrder`, quedando:
  - `heldForWithdrawal=true`
  - `releasesAt = createdAt + 14 días`
- Liberación:
  - mediante cron/webhook (`releaseMaturedPayouts`) o en sandbox actual (actualiza payouts directamente).

Archivos clave:

- `packages/auth/src/payment.service.ts`
- `apps/web/src/app/api/cron/release-payouts/route.ts`
- `apps/web/src/app/api/stripe/webhook/route.ts`

### B5. Emails transaccionales

Templates y envío:

- Confirmación de pedido: `sendOrderConfirmationEmail`
- Envío: `sendShipmentNotificationEmail`

Arquitectura:

- `packages/auth/src/email.service.ts` (proveedor configurable / dev console)
- Llamadas desde `checkout.service.ts` y `order.service.ts`

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

- Variables `MARKETPLACE_*` en `.env` (nombre, datos fiscales, logo vía `public/logo.png`).
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

### B8. Admin: KPIs, rentabilidad, rappels, piloto y sandbox

- `apps/web/src/app/admin/kpis/page.tsx`
- `apps/web/src/app/admin/rentabilidad/page.tsx`
- `apps/web/src/app/admin/rappels/page.tsx`
- `apps/web/src/app/admin/piloto/*`
- `apps/web/src/app/admin/sandbox/*`

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

### B10. Imágenes por categoría y placeholders (incluye “Reposteria”)

#### B10.1. Requisito
Si un productor no sube foto, el sistema debe mostrar un **PNG por defecto** según la categoría (incluyendo nuevas categorías como “Reposteria”).

#### B10.2. Soluciones aplicadas
- Se añadió la categoría “Reposteria” en el `seed.ts` para que aparezca en `listCategories()`.
- Se añadió el PNG de placeholder en:
  - `apps/web/public/categories/reposteria.png`
- El form y las tarjetas de producto usan un placeholder calculado en función de la categoría/subcategoría seleccionada.
- Para evitar problemas de validación al enviar la foto:
  - se normaliza la `imageUrl` a URL absoluta en el `parseProductForm`,
  - y se configuró `next/image` para permitir `localhost` en dev (`remotePatterns`).

