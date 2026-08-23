# Documentos PDF del marketplace

![Logo Sabores de la Culebra](./imagenes/logo.png)

## Resumen

El marketplace genera **documentos PDF bajo demanda** para:

1. **Pedidos del consumidor** — justificante de compra / resumen de pedido.
2. **Pedidos del productor** — resumen operativo y liquidación del subpedido.
3. **Cambios de producto** — registro de modificaciones hechas por el proveedor.

Los PDF no se guardan como ficheros en disco: se **generan al descargar** a partir de datos en base de datos (`Order`, `VendorOrder`, `StoredDocument`).

Todos los documentos incluyen en la cabecera:

- **Logo** del marketplace (`apps/web/public/logo.png`)
- **Nombre** configurado en `MARKETPLACE_NAME` (por defecto: *Sabores de la Culebra*)
- **Fecha** del pedido o del cambio registrado

---

## Tipos de documento

| Tipo | Enum | Retención del registro | Quién puede descargarlo |
|------|------|------------------------|-------------------------|
| Justificante de pedido (cliente) | `ORDER_CUSTOMER` | 4 años | Comprador (logueado o invitado con email), admin |
| Resumen de pedido (productor) | `ORDER_VENDOR` | 4 años | Productor del subpedido |
| Cambio de producto | `PRODUCT_CHANGE` | 3 meses | Productor propietario del producto |

La retención aplica al **registro en `StoredDocument`** (metadatos + snapshot JSON). El PDF se reconstruye en cada descarga mientras el registro no haya expirado.

---

## Rutas API

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `GET /api/orders/[orderNumber]/document` | Consumidor / invitado | PDF del pedido completo |
| `GET /api/vendor-orders/[id]/document` | Productor | PDF del subpedido asignado al productor |
| `GET /api/admin/orders/[orderNumber]/document` | Admin | PDF del pedido (vista administrativa) |
| `GET /api/stored-documents/[id]/document` | Propietario / admin | PDF según `kind` del registro almacenado |

Parámetro opcional para admin en stored documents: `?admin=1`.

Respuesta correcta: `Content-Type: application/pdf` con `Content-Disposition: attachment`.

---

## Puntos de acceso en la interfaz

### Consumidor

- Detalle de pedido: `/pedido/[orderNumber]` → **Descargar PDF**
- Historial: `/cuenta/pedidos` (enlace al detalle con PDF)

### Productor

- Subpedido: `/panel/proveedor/pedidos/[id]` → **Descargar PDF**
- Producto editado: `/panel/proveedor/productos/[id]` → historial de cambios → **PDF del cambio**
- Compras propias como consumidor: `/panel/proveedor/mis-compras` → PDF de pedidos y cambios

### Admin

- Pedido: `/admin/pedidos/[orderNumber]` → **Descargar PDF del pedido**

---

## Contenido de cada PDF

### Justificante de pedido (cliente)

- Cabecera con logo, nombre y fecha del pedido
- Datos del cliente, estado, método de pago
- Dirección de envío y facturación (si existen)
- Detalle de líneas (producto, productor, cantidades, IVA, importes)
- Totales (subtotal, IVA, total pagado)
- Seguimiento por productor
- Aviso legal de derecho de desistimiento (14 días)
- Datos fiscales del marketplace (`MARKETPLACE_LEGAL_NAME`, NIF, dirección, email)

### Resumen de pedido (productor)

- Cabecera con logo, nombre y fecha
- Referencias del pedido marketplace y del productor
- Datos del cliente (nombre, email, teléfono)
- Dirección de envío y notas
- Líneas del subpedido con desglose de IVA
- Liquidación: subtotal, IVA, comisión marketplace, neto a recibir
- Seguimiento registrado (si existe)

### Registro de cambio de producto

- Cabecera con logo, nombre y fecha del cambio
- Producto, referencia interna, fecha de conservación del registro
- Campos modificados con valores **antes** y **después**
- Nota legal de trazabilidad (mínimo 3 meses)

---

## Modelo de datos

Tabla `StoredDocument` (Prisma):

```prisma
model StoredDocument {
  id             String             @id @default(cuid())
  kind           StoredDocumentKind // ORDER_CUSTOMER | ORDER_VENDOR | PRODUCT_CHANGE
  ownerUserId    String?
  entityType     String             // "Order" | "VendorOrder" | "Product"
  entityId       String
  title          String
  snapshot       Json               // copia estructurada en el momento del evento
  retentionUntil DateTime
  createdAt      DateTime           @default(now())
}
```

### Cuándo se crean los registros

- **Pedidos**: al confirmar el checkout (`recordOrderDocuments` en `checkout.service.ts`).
- **Cambios de producto**: al actualizar un producto o su PVP/stock (`recordProductChangeDocument` en `product.service.ts`).

### Limpieza automática

Cron protegido con `CRON_SECRET`:

```
GET /api/cron/purge-documents
Authorization: Bearer {CRON_SECRET}
```

Elimina registros con `retentionUntil` vencido (`purgeExpiredStoredDocuments`).

---

## Implementación técnica

### Generación PDF (apps/web)

| Archivo | Función |
|---------|---------|
| `apps/web/src/lib/pdf-document-header.ts` | Cabecera común (logo, nombre, fecha) |
| `apps/web/src/lib/order-document.ts` | PDFs de pedido cliente y productor |
| `apps/web/src/lib/product-change-document.ts` | PDF de cambios de producto |
| `apps/web/src/components/orders/download-order-document-button.tsx` | Botón reutilizable de descarga |

Librería: **pdfkit** (generación en servidor Node.js).

### Lógica de negocio (packages/auth)

| Archivo | Función |
|---------|---------|
| `packages/auth/src/stored-document.service.ts` | CRUD de registros, retención, snapshots |
| `packages/auth/src/checkout.service.ts` | Registro de documentos al crear pedido |
| `packages/auth/src/product.service.ts` | Registro al editar producto |

### Configuración Next.js

En `apps/web/next.config.ts`:

- `pdfkit` y `fontkit` en `serverExternalPackages` (evita errores de fuentes al empaquetar).
- Alias de webpack a `packages/auth/dist` para usar el build compilado del paquete auth.

### Variables de entorno

En `.env` (ver `.env.example`):

```env
MARKETPLACE_NAME=Sabores de la Culebra
MARKETPLACE_LEGAL_NAME=
MARKETPLACE_TAX_ID=
MARKETPLACE_EMAIL=
MARKETPLACE_ADDRESS=
CRON_SECRET=...
```

---

## Build y despliegue

Antes de `next build` en producción:

```bash
npm run build --workspace @culebra/auth
```

El script de build de `@culebra/web` ya incluye este paso.

Tras cambios en `packages/auth`, recompilar auth para actualizar `dist/`:

```bash
npm run build --workspace @culebra/auth
```

---

## Seguridad y acceso

- Los endpoints exigen sesión válida (salvo pedido de invitado con validación de email en la ruta de pedidos).
- `getStoredDocumentForOwner` comprueba `ownerUserId` y que `retentionUntil > now()`.
- Admin puede acceder a documentos expirados o ajenos mediante rutas y flags administrativos.
- Los PDF no se cachean en CDN (`Cache-Control: no-store`).

---

## Relacionado

- [Pedidos](./orders.md) — flujo de compra y estados
- [Manual de usuario](./Manual_Usuario_Marketplace.md) — uso desde la interfaz
- [Manual de desarrollador](./Manual_Desarrollador_Marketplace.md) — detalle técnico ampliado
