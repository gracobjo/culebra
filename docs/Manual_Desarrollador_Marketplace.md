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

### B6. Reviews post-compra (server action)

Flujo:

- En `.../pedido/[orderNumber]/review-actions.ts` hay un server action con:
  - validación de sesión,
  - verificación de pertenencia al pedido,
  - validación de que el producto está en el pedido,
  - prevención de duplicidad.

### B7. Admin: KPIs, rentabilidad, rappels, piloto y sandbox

- `apps/web/src/app/admin/kpis/page.tsx`
- `apps/web/src/app/admin/rentabilidad/page.tsx`
- `apps/web/src/app/admin/rappels/page.tsx`
- `apps/web/src/app/admin/piloto/*`
- `apps/web/src/app/admin/sandbox/*`

### B8. Diagramas y modelado

Para cambios en BD o lógica:

- Prisma Schema en `packages/db/prisma/schema.prisma`
- Recomendado: actualizar migración y revisar side-effects en:
  - `payment.service.ts`
  - `order.service.ts`
  - paneles admin que calculan métricas.

