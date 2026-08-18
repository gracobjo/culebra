# Base de datos

## Estado

FASE 2 completada: esquema Prisma, migracion inicial, seed de roles y categorias.

## Stack

- PostgreSQL 16
- Prisma ORM
- Paquete: `packages/db` (`@culebra/db`)

## Entidades principales

| Modulo | Entidades |
|--------|-----------|
| Usuarios | `User`, `Role`, `UserRole`, `UserSession`, `PasswordResetToken` |
| Proveedores | `Vendor`, `VendorDocument` |
| Contratos | `VendorContract`, `VendorContractVersion`, `ContractAcceptance` |
| Comisiones | `CommissionRule` (versionadas) |
| Catalogo | `Category`, `Product`, `ProductVariant`, `ProductImage`, `Inventory` |
| Carrito | `Cart`, `CartItem` (soporta invitado via `sessionId`) |
| Pedidos | `Order`, `OrderItem`, `VendorOrder`, `VendorOrderItem` |
| Pagos | `Payment`, `Refund`, `Payout` |
| Envios | `Shipment` |
| Otros | `Address`, `Review`, `Favorite`, `Notification`, `AuditLog` |

## Decisiones de diseno

### Pedidos multi-vendedor

- `Order`: pedido unico visible al consumidor.
- `OrderItem`: lineas con snapshot de precio, IVA y comision.
- `VendorOrder`: subpedido por proveedor.
- `VendorOrderItem`: enlace entre subpedido y lineas del pedido global.

### Compra como invitado

- `Order.userId` es nullable.
- `Order.customerEmail` es obligatorio.
- `shippingAddressSnapshot` y `billingAddressSnapshot` almacenan JSON congelado al checkout.

### Comisiones y contratos

- Nunca se modifican retroactivamente.
- Cada cambio genera una nueva version (`CommissionRule.versionNumber`, `VendorContractVersion.versionNumber`).
- Los importes aplicados se guardan como snapshot en `OrderItem` y `VendorOrder`.

### Soft delete

- `User.deletedAt`, `Vendor.deletedAt`, `Product.deletedAt` para borrado logico.

## Categorias iniciales (seed)

1. Embutidos y productos carnicos (+ 5 subcategorias)
2. Quesos y lacteos (+ 4 subcategorias)
3. Vinos (+ 4 subcategorias)
4. Licores (+ 2 subcategorias)
5. Miel y productos apicolas (+ 4 subcategorias)
6. Productos tradicionales

## Roles iniciales (seed)

- `ADMIN`
- `VENDOR`
- `CONSUMER`

## Comandos

```bash
# Levantar PostgreSQL local
npm run docker:up

# Generar cliente Prisma
npm run db:generate

# Crear/aplicar migraciones (desarrollo)
npm run db:migrate

# Seed de roles y categorias
npm run db:seed

# Verificar conexion
npm run db:check

# Prisma Studio
npm run db:studio
```

## Variables de entorno

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/culebra
```

Copiar `.env.example` a `.env` en la raiz del proyecto y, opcionalmente, a `packages/db/.env`.

## Diagrama simplificado

```mermaid
erDiagram
  User ||--o{ Order : places
  User ||--o| Vendor : owns
  Vendor ||--o{ Product : sells
  Product ||--o{ ProductVariant : has
  Category ||--o{ Product : categorizes
  Order ||--o{ OrderItem : contains
  Order ||--o{ VendorOrder : splits
  VendorOrder ||--o{ VendorOrderItem : contains
  VendorOrderItem }o--|| OrderItem : references
  Order ||--o| Payment : has
  VendorOrder ||--o| Shipment : fulfills
  Vendor ||--o{ VendorContract : has
  VendorContract ||--o{ VendorContractVersion : versions
```

## Siguiente fase

FASE 9: contratos versionados. Los campos Stripe Connect estan en `Vendor`.
