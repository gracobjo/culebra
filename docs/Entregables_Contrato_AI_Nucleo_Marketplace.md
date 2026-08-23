# Entregables — Contrato A.I (núcleo marketplace)

![Logo Sabores de la Culebra](./imagenes/logo.png)

**Partida:** A.I · **14.500 €** (servicio ≤ 15.000 € sin IVA)  
**Objeto:** Desarrollo del núcleo funcional del marketplace multi-vendedor.  
**Subpartidas WBS:** A.1 + A.2 + A.3 + A.5a  
**Fuera de alcance (contrato A.II):** A.4 pagos/retención · A.5b cierre fino admin · A.6 seguridad/producción.

**Referencias:** [`Memoria_Tecnica_Justificativa_…` §25.2](./Memoria_Tecnica_Justificativa_ICECYL_Diputacion_LaRaya_v1.md) · [`Borrador_4447_1001_…`](./Borrador_4447_1001_Memoria_Tecnica_La_Raya.md) · [`Cuaderno_Ejecucion_Justificacion.md`](./Cuaderno_Ejecucion_Justificacion.md) · [`Wireframes_UIUX_Contrato_AI.md`](./Wireframes_UIUX_Contrato_AI.md) · [`architecture.md`](./architecture.md)

---

## 1. Resumen de cumplimiento técnico

| Código | Entregable WBS | Importe | Estado técnico | Evidencia principal |
|--------|----------------|--------:|:--------------:|---------------------|
| **A.1** | Arquitectura, BD, UI/UX, entorno | 3.500 € | **Cumplido** | Schema Prisma + docs + wireframes + Docker |
| **A.2** | Catálogo + panel productor | 5.000 € | **Cumplido** | `/tienda`, `/panel/proveedor`, productos/stock |
| **A.3** | Cesta, pedidos, checkout | 4.000 € | **Cumplido** | Carrito agrupado + `VendorOrder` + estados |
| **A.5a** | Comisión base + admin usable | 2.000 € | **Cumplido** | `CommissionRule` + `/admin/*` |
| | **Total A.I** | **14.500 €** | | |

> “Cumplido” = entregable **software/documentación** verificable en repositorio. No implica factura, pago ni admisión ICECYL (eso vive en el Cuaderno).

---

## 2. A.1 — Arquitectura, BD y UI/UX (3.500 €)

### Criterio de aceptación
1. Modelo de datos multi-vendedor documentado e implementado.  
2. Arquitectura base del monorepo descrita.  
3. Wireframes / diseño UI-UX de pantallas núcleo archivados.  
4. Entorno técnico común reproducible (local / Docker).

### Cumplimiento

| Elemento | Dónde |
|----------|-------|
| Modelo multi-vendedor (`Vendor`, `Product`, `Order`/`VendorOrder`, carrito…) | `packages/db/prisma/schema.prisma` · [`database.md`](./database.md) |
| Arquitectura monorepo | [`architecture.md`](./architecture.md) · `README.md` |
| Wireframes UI/UX | [`Wireframes_UIUX_Contrato_AI.md`](./Wireframes_UIUX_Contrato_AI.md) · guía [`ux.md`](./ux.md) |
| Entorno común | `docker-compose.yml` · `infra/database-setup.md` · seed `packages/db/prisma/seed.ts` |
| RBAC (ADMIN / VENDOR / CONSUMER) | `apps/web/src/middleware.ts` · `@culebra/domain` |

### Rutas de verificación
- `/` · `/tienda` · `/login` · paneles protegidos.

---

## 3. A.2 — Catálogo y panel del proveedor (5.000 €)

### Criterio de aceptación
1. Perfil público y de gestión del vendedor.  
2. Alta/edición de productos con precio y stock.  
3. Panel del proveedor operativo para el piloto.

### Cumplimiento

| Elemento | Dónde |
|----------|-------|
| Perfiles vendedor | `/productores`, `/productores/[slug]` · `/panel/proveedor` · `/quiero-vender` |
| Productos, precios, stock | `/panel/proveedor/productos` · `product-form.tsx` · `Inventory` en Prisma |
| Catálogo público | `/tienda` · `/productos` · `/categorias/[slug]` · `/productos/[slug]` |
| Moderación | `/admin/productores` · `/admin/productos` |
| Docs | [`catalog.md`](./catalog.md) · [`vendor-management.md`](./vendor-management.md) |

### Rutas de verificación
1. Solicitar alta en `/quiero-vender`.  
2. Aprobar en admin.  
3. Crear producto con stock en panel.  
4. Ver ficha en tienda pública.

---

## 4. A.3 — Pedidos, carrito y checkout (4.000 €)

### Criterio de aceptación
1. Cesta unificada con líneas de varios productores.  
2. Desglose visible por productor (cesta y/o pedido).  
3. Estados de pedido (pedido global + por productor).  
4. Flujo de compra end-to-end hasta pedido registrado.

### Cumplimiento

| Elemento | Dónde |
|----------|-------|
| Cesta unificada | `/carrito` · `packages/auth/src/cart.service.ts` |
| Desglose por productor | `/carrito` (secciones por vendedor) · `/pedido/[orderNumber]` |
| Split multi-vendedor | `packages/auth/src/checkout.service.ts` → `VendorOrder` |
| Estados | enums `OrderStatus` / `VendorOrderStatus` · panel pedidos · [`orders.md`](./orders.md) |
| Flujo compra | `/checkout` · `checkout-form.tsx` · [`cart.md`](./cart.md) |

### Rutas de verificación
1. Añadir productos de ≥ 2 productores.  
2. Ver agrupación en `/carrito`.  
3. Completar checkout.  
4. Comprobar subpedidos en `/pedido/[orderNumber]` y `/panel/proveedor/pedidos`.

> **Nota A.II:** cobro Stripe, split de payout y retención 14 días = **A.4**, no A.3.

---

## 5. A.5a — Comisión básica y admin usable (2.000 €)

### Criterio de aceptación
1. Regla de comisión por defecto aplicada al pedido (snapshot).  
2. Panel admin usable para productores, productos, pedidos y comisión.  
3. Sin exigir el “cierre fino” (condiciones versionadas finales / moderación avanzada = **A.5b**).

### Cumplimiento

| Elemento | Dónde |
|----------|-------|
| Comisión base 17 % + mínimo 4 € | `packages/domain` · `commission.service.ts` · [`commissions.md`](./commissions.md) |
| Reglas versionadas | modelo `CommissionRule` · formularios admin |
| Panel admin | `/admin` · productores · productos · pedidos · liquidaciones · usuarios · auditoría · [`admin.md`](./admin.md) |
| Asignación comisión a productor | `/admin/productores/[id]` |

### Rutas de verificación
1. Abrir `/admin` (rol ADMIN).  
2. Revisar productor y regla de comisión.  
3. Crear pedido de prueba y comprobar comisión en líneas / liquidación orientativa.

---

## 6. Checklist de acta interna (cerrar A.I)

Usar al firmar recepción del servicio A.I (antes o junto a factura):

- [ ] A.1 — Arquitectura y schema revisados; wireframes archivados; entorno arranca (`docker compose` / docs).  
- [ ] A.2 — Al menos 1 productor piloto con ≥ 1 producto publicado (precio + stock).  
- [ ] A.3 — Pedido de prueba multi-vendedor con desglose por productor.  
- [ ] A.5a — Admin puede listar productores/productos/pedidos y ver comisión aplicada.  
- [ ] Capturas o URL de staging/producción guardadas en carpeta documental del Cuaderno.  
- [ ] Este documento + commit/tag de repositorio citados en el Cuaderno (fila P001a).

**Fecha acta:** _______________  
**Responsable técnico:** _______________  
**Responsable proyecto:** _______________

---

## 7. Mapa rápido de código (núcleo A.I)

```text
packages/db/prisma/schema.prisma     → modelo multi-vendedor
packages/auth/src/cart.service.ts    → cesta
packages/auth/src/checkout.service.ts→ split VendorOrder
packages/auth/src/commission.service.ts → comisión
packages/auth/src/product.service.ts / vendor.service.ts
apps/web/src/app/tienda/             → escaparate
apps/web/src/app/carrito/            → cesta unificada
apps/web/src/app/checkout/           → flujo compra
apps/web/src/app/panel/proveedor/    → panel productor
apps/web/src/app/admin/              → panel admin
```
