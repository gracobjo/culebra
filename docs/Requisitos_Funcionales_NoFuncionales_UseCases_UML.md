# Requisitos Funcionales / No Funcionales + Casos de Uso + UML

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)

**Documentos relacionados:** [Manual de usuario](./Manual_Usuario_Marketplace.md) · [Manual de desarrollador](./Manual_Desarrollador_Marketplace.md) · [Turismo](./tourism.md)

---

## C. Requisitos Funcionales (RF) y No Funcionales (RNF)

### C1. Requisitos Funcionales

RF-01 Autenticación y roles

- El sistema debe soportar login/register y roles: ADMIN, VENDOR, CONSUMER.
- Debe proteger rutas de panel productor y panel admin.

RF-02 Catálogo, hub tienda y categorías

- El consumidor debe poder ver el hub `/tienda`, categorías agro y productos publicados.
- Las entradas de turismo/packs en el hub no deben mezclar la reserva de noche en el checkout de productos.

RF-03 Carrito multi-proveedor

- El consumidor debe poder añadir productos de diferentes productores.
- El backend debe calcular comisión marketplace y neto por productor.
- El carrito debe mostrar subtotal, descuentos, **envío** y total a pagar, incluyendo el progreso hacia el umbral de envío gratis.

RF-04 Checkout con Stripe Connect + Bizum

- Debe existir flujo de checkout que habilite tarjeta y Bizum.
- Debe crear sesión Stripe con metadata del pedido.
- El importe de pago debe incluir `shippingAmount` cobrado al cliente (0 si envío gratis).

RF-05 Split funds y retención 14 días (desistimiento)

- El sistema debe crear payouts por `VendorOrder` en estado retenido.
- Debe registrar `releasesAt` y `heldForWithdrawal`.

RF-06 Liberación de payouts

- Debe existir mecanismo (cron/webhook) para liberar payouts cuyo `releasesAt` ha vencido.

RF-07 Emails transaccionales

- Debe enviarse email de confirmación de pedido.
- Debe enviarse email de aviso de envío cuando el productor marca el subpedido como SHIPPED.

RF-08 Shipping y estados de VendorOrder

- El productor debe poder cambiar el estado de VendorOrder siguiendo transiciones válidas.
- Al SHIPPED se crea/actualiza Shipment y se sincroniza el pedido padre.

RF-09 Reviews post-compra

- Debe existir formulario de reviews con validación.
- Debe impedir duplicados por producto dentro de un pedido pagado.

RF-10 Panel Admin de KPIs

- Debe mostrar KPIs con objetivos y niveles de severidad.

RF-11 Panel Rentabilidad

- Debe calcular beneficio neto por transacción con desglose de costes imputables.

RF-12 Panel Rappels

- Debe calcular tramos y rappel teórico por productor en base a facturación anual.

RF-13 Grupo Piloto

- Admin debe gestionar productores piloto con tareas por fase y estados.

RF-14 Sandbox de validación

- Admin debe poder ejecutar simulaciones para validar flujo end-to-end sin Stripe real.

RF-15 Hub tienda de la comarca

- Debe existir `/tienda` que agrupe categorías agroalimentarias y entradas a turismo/packs.
- `/categorias` (índice) puede redirigir al hub; las fichas `/categorias/[slug]` siguen siendo catálogo agro.

RF-16 Directorio de alojamientos (fase 2)

- Debe listar alojamientos publicados con enlace de reserva externa (Booking, web, WhatsApp, teléfono, email).
- Debe permitir cross-sell producto ↔ alojamiento sin integrar la noche en el checkout.

RF-17 Packs territoriales (fase 3)

- Debe permitir packs “noche + lote gourmet”: el lote se añade al carrito como productos; la noche permanece como enlace externo al alojamiento.

RF-18 Cupones

- Debe poder aplicarse un cupón al carrito (% o fijo) con validación de vigencia y mínimo de pedido.
- El descuento se refleja en `Order.discountAmount` / `Order.couponCode` y en el importe de pago.

RF-19 Afiliación

- Debe capturar `?ref=CODIGO`, persistirlo (cookie) y asociarlo al pedido (`Order.affiliateCode`) si el código está activo.

RF-20 Admin turismo

- Admin debe poder gestionar alojamientos, packs, cupones y códigos de afiliado desde `/admin/turismo`.

RF-21 Umbral de envío gratuito (logística)

- Si el merchandise del pedido (subtotal − cupón) es **&lt; 49 €**, el cliente paga **4,95 €** de envío (`Order.shippingAmount`).
- Si el merchandise es **≥ 49 €**, el envío es **gratis** para el cliente (`shippingAmount = 0`).
- El coste logístico del envío gratis lo **absorbe el marketplace** desde su comisión; el productor conserva su **85 %** íntegro sobre el producto (no se le descuenta el porte).
- La UI debe informar “te faltan X € para envío gratis” cuando aplique.
- Constantes de dominio: `FREE_SHIPPING_THRESHOLD_EUR`, `CUSTOMER_SHIPPING_FEE_EUR`, `MARKETPLACE_SHIPPING_COST_EUR`.

### C2. Requisitos No Funcionales

RNF-01 Seguridad

- Proteger cron con `CRON_SECRET`.
- Verificar autenticación/roles en paneles.
- No exponer secretos en logs.

RNF-02 Robustez ante idempotencia de webhooks

- Webhook debe tolerar reintentos (ej.: `markOrderPaid` no recrea payouts si ya está PAID).

RNF-03 Confidencialidad

- Separación de configuración por entorno.

RNF-04 Observabilidad

- Logs best-effort para emails (no bloquear transacciones).

RNF-05 Rendimiento

- Listados paginados (orders, payouts, etc.).

RNF-06 Cumplimiento legal

- Retención de 14 días aplicada a payouts.

RNF-07 Separación checkout agro / reserva turística

- La reserva de alojamiento no debe mezclarse en el mismo checkout de productos (evita complejidad legal/pago de estancias y mantiene el núcleo agroalimentario del expediente).

RNF-08 Transparencia de portes

- El importe de envío cobrado al cliente y la condición de envío gratis deben ser visibles antes de confirmar el pago (carrito y checkout).

---

## D. Casos de Uso (Use Cases) — Alto nivel

Actores:

- **Consumidor**
- **Productor**
- **Administrador**
- **Sistema** (webhook/cron)
- **Alojamiento / afiliado** (actor externo; recibe tráfico vía `?ref=` o directorio)

Use cases principales:

- UC-01 Consultar catálogo y hub `/tienda`
- UC-02 Gestionar carrito multi-vendor (incl. cupón y umbral de envío)
- UC-03 Realizar checkout (Stripe Connect + Bizum; cupón/afiliado/envío)
- UC-04 Confirmación de pago (webhook) → marcar pedido pagado
- UC-05 Crear payouts retenidos (heldForWithdrawal + releasesAt)
- UC-06 Liberar payouts maduros (cron)
- UC-07 Productor confirma y envía pedido (shipping operativo)
- UC-08 Envío de email de shipment
- UC-09 Consumidor deja review post-compra
- UC-10 Admin consulta KPIs y rentabilidad
- UC-11 Admin gestiona grupo piloto
- UC-12 Sandbox: simular pago y shipping para validación
- UC-13 Consultar directorio de alojamientos y abrir reserva externa
- UC-14 Añadir pack (lote) al carrito y reservar noche fuera
- UC-15 Aplicar cupón / registrar afiliado en pedido
- UC-16 Admin gestiona turismo (alojamientos, packs, cupones, afiliados)
- UC-17 Calcular y aplicar umbral de envío gratuito (4,95 € / gratis ≥ 49 €)

---

## E. Especificación de los flujos más importantes (detalle)

### E1. Checkout → pago OK → split → payouts retenidos

Precondiciones:

- Existe `Order` con `Payment` en `PAYMENT_PENDING`.
- Existe sesión stripe creada con metadata `orderNumber`.

Postcondiciones:

- `Payment.status = PAYMENT_PAID`
- `Order.status = PAID` (si aplica por estados de shipping)
- Se crean `Payout` por cada `VendorOrder` asociado:
  - `heldForWithdrawal = true`
  - `releasesAt = now + 14 días`

Puntos críticos:

- Idempotencia: si el pago ya está PAID no duplicar.
- Webhook: tolerar reintentos y eventos ordenados fuera de secuencia.

### E2. Liberación de payouts al vencimiento de retención

Precondiciones:

- Payouts con `heldForWithdrawal=true` y `releasesAt <= now`.

Postcondiciones:

- Payouts pasan a `heldForWithdrawal=false` y estado final (PAID/FAILED).
- Se ejecuta transfer (real) si Stripe está configurado; en sandbox se simula localmente.

### E3. Shipping: `VendorOrder.SHIPPED` → Shipment + email

Precondiciones:

- Actor: `VENDOR` autenticado y propietario del `VendorOrder`.
- Transición válida (PENDING/CONFIRMED/IN_PREPARATION → SHIPPED).

Postcondiciones:

- `VendorOrder.status = SHIPPED`
- `Shipment.status = SHIPPED`, `shippedAt = now`
- Email best-effort enviado al comprador con tracking.

### E4. Reviews post-compra

Precondiciones:

- Usuario logueado.
- Orden pagada y pertenece al usuario.
- Producto existe en el pedido.
- No existe review previa para ese producto.

Postcondiciones:

- Se crea `Review` con rating + contenido opcional.

### E5. Admin: Rentabilidad por transacción

Precondiciones:

- Existen `Payout` y relación a `VendorOrder`/`Order`.

Postcondiciones:

- KPI por transacción con desglose de:
  - comisión marketplace
  - costes imputables (Stripe processing, amortización, envasado, transporte, cloud/gestoría)
  - beneficio neto y margen.

### E6. Pack + reserva externa (sin mezclar checkout)

Precondiciones:

- Pack publicado con ítems de producto `PUBLISHED`.
- Alojamiento publicado (opcional) con `bookingUrl` / canal de reserva.

Flujo:

1. Consumidor en `/packs/[slug]` añade el **lote** al carrito (`addPackToCart`).
2. Si el pack tiene cupón asociado, se intenta aplicar al carrito.
3. Consumidor abre el enlace de reserva del alojamiento (fuera del marketplace).
4. Checkout del carrito cobra productos (+ descuento cupón si aplica) **y** el envío según umbral (RF-21).

Postcondiciones:

- Pedido con líneas de producto; sin línea de “noche”.
- Si había `?ref=`, `Order.affiliateCode` informativo.

### E7. Cupón en carrito → pedido

Precondiciones:

- Cupón activo, dentro de fechas, bajo `maxRedemptions`, y subtotal ≥ `minOrderAmount`.

Postcondiciones:

- `Cart.couponCode` / `Order.couponCode`, `Order.discountAmount`.
- `Payment.amount` = merchandise tras descuento **+** `shippingAmount`.
- `CouponRedemption` + incremento de `redemptionCount`.

### E8. Umbral de envío gratuito

Precondiciones:

- Carrito con al menos una línea de producto.

Regla (`computeShippingQuote`):

| Merchandise (subtotal − cupón) | `Order.shippingAmount` |
|--------------------------------|-----------------------:|
| &lt; 49 € | 4,95 € |
| ≥ 49 € | 0 € (gratis) |

Postcondiciones:

- `Order.totalAmount` = merchandise + `shippingAmount`.
- El neto al productor **no** se reduce por el porte gratis; el marketplace absorbe el coste interno (~5 €) desde su comisión.
- UI: mensaje de progreso hacia el umbral si el envío no es gratis.

---

## F. Diagramas UML (los 4 principales + otros útiles)

> Nota: Los diagramas se expresan con Mermaid para integrarlos en documentación.

### F1. Diagrama de clases (estático)

```mermaid
classDiagram
  class User{
    id
    email
    passwordHash
    status
  }
  class Role{
    id
    name
  }
  class Vendor{
    id
    userId
    tradeName
    stripeAccountId
    stripeChargesEnabled
  }
  class Order{
    id
    orderNumber
    status
    customerEmail
    subtotalGross
    discountAmount
    shippingAmount
    totalAmount
    createdAt
  }
  class Payment{
    id
    status
    amount
    stripePaymentIntentId
  }
  class VendorOrder{
    id
    status
    vendorNetAmount
    orderId
    vendorId
  }
  class Payout{
    id
    status
    heldForWithdrawal
    releasesAt
    stripeTransferId
  }
  class Shipment{
    id
    status
    carrier
    trackingNumber
    shippedAt
    deliveredAt
  }
  class Review{
    id
    rating
    title
    comment
    createdAt
  }
  class Accommodation{
    id
    slug
    name
    bookingUrl
    bookingChannel
    status
  }
  class TourismPack{
    id
    slug
    name
    accommodationId
    status
  }
  class Coupon{
    id
    code
    discountType
    discountValue
    isActive
  }
  class AffiliateCode{
    id
    code
    accommodationId
    isActive
  }
  class PilotProducer{
    id
    category
    producerName
    status
    commissionPct
  }
  class PilotTask{
    id
    phase
    title
    status
  }

  User "1" --> "0..*" Role : has
  User "1" --> "0..1" Vendor : becomes
  Vendor "1" --> "0..*" VendorOrder : owns
  Order "1" --> "0..1" Payment
  Order "1" --> "1..*" VendorOrder
  Order "0..*" --> "0..1" Coupon : mayRedeem
  VendorOrder "1" --> "0..1" Shipment
  VendorOrder "1" --> "0..1" Payout
  User "1" --> "0..*" Review : writes
  Accommodation "1" --> "0..*" TourismPack : optional
  Accommodation "1" --> "0..*" AffiliateCode : optional
  TourismPack "0..1" --> "0..1" Coupon : optional
  PilotProducer "1" --> "0..*" PilotTask : has
```

### F2. Diagrama de casos de uso (funcional)

```mermaid
flowchart LR
  %% Actores
  Consumidor(["👤 Consumidor"])
  Productor(["🏭 Productor"])
  Admin(["🛠 Administrador"])
  Cron(["⏰ CronJob"])
  Stripe(["💳 StripeWebhook"])

  %% Casos de uso (elipses)
  UC01(["Consultar hub /tienda y catálogo"])
  UC02(["Gestionar carrito + cupón + umbral envío"])
  UC03(["Realizar checkout"])
  UC04(["Dejar review"])
  UC05(["Confirmar pedido"])
  UC06(["Marcar envío SHIPPED"])
  UC07(["Marcar entregado"])
  UC08(["Ver KPIs"])
  UC09(["Ver rentabilidad"])
  UC10(["Gestionar rappels"])
  UC11(["Gestionar grupo piloto"])
  UC12(["Ejecutar sandbox"])
  UC13(["Confirmar pago"])
  UC14(["Liberar payouts maduros"])
  UC15(["Consultar alojamientos / reserva externa"])
  UC16(["Añadir pack lote al carrito"])
  UC17(["Admin turismo"])
  UC18(["Aplicar umbral envío gratis"])

  %% Relaciones
  Consumidor --- UC01
  Consumidor --- UC02
  Consumidor --- UC03
  Consumidor --- UC04
  Consumidor --- UC15
  Consumidor --- UC16
  Consumidor --- UC18

  Productor --- UC05
  Productor --- UC06
  Productor --- UC07

  Admin --- UC08
  Admin --- UC09
  Admin --- UC10
  Admin --- UC11
  Admin --- UC12
  Admin --- UC17

  Stripe --- UC13
  Cron   --- UC14
```

### F3. Diagrama de secuencia (checkout + retención)

```mermaid
sequenceDiagram
  participant C as Consumidor
  participant Web as Next.js Web
  participant Auth as @culebra/auth
  participant Stripe as Stripe
  participant Webhook as /api/stripe/webhook
  participant DB as PostgreSQL

  C->>Web: Checkout (Bizum/tarjeta)
  Web->>Auth: createOrderCheckoutSession(orderNumber)
  Auth->>Stripe: checkout.sessions.create()
  Stripe-->>Web: Checkout URL / success flow
  StripeWebhook->>Webhook: evento (payment ok)
  Webhook->>Auth: handleStripeWebhook(rawBody, signature)
  Auth->>DB: markOrderPaid(orderNumber)
  Auth->>DB: createVendorTransfers()
  DB-->>Auth: Payouts creados (heldForWithdrawal=true, releasesAt=+14d)
  Auth-->>Webhook: {received:true}
```

### F4. Diagrama de actividades (shipping y email)

```mermaid
flowchart TD
  A[Productor inicia "Enviar"] --> B{VendorOrder estado actual}
  B -->|PENDING| C[updateVendorOrderStatus -> CONFIRMED]
  B -->|CONFIRMED| D[updateVendorOrderStatus -> SHIPPED]
  B -->|IN_PREPARATION| D
  C --> D
  D --> E[Crear/actualizar Shipment: SHIPPED + shippedAt]
  E --> F[Sincronizar estado del pedido padre]
  F --> G[Enviar email de aviso de envío (best-effort)]
  G --> H[Fin]
```

### F5. Diagrama de estados (payout retention)

```mermaid
stateDiagram-v2
  [*] --> PENDING_RETAINED: payout creado
  PENDING_RETAINED --> READY: releasesAt vencido
  READY --> PROCESSING: release ejecutada
  PROCESSING --> PAID: transferencia OK
  PROCESSING --> FAILED: transferencia error
  READY --> PAID: sandbox libera sin Stripe
```

### F6. Diagrama de despliegue (deployment)

```mermaid
flowchart TB
  subgraph Cliente
    UI[apps/web (Next.js App Router)]
  end
  subgraph Servidor
    API[API routes (webhook/cron/admin)]
    Auth[@culebra/auth (lógica pagos/email/shipping/reviews)]
  end
  subgraph Persistencia
    DB[(PostgreSQL)]
  end
  subgraph Terceros
    Stripe[Stripe Checkout + Connect]
    Email[Proveedor email (Resend/SendGrid/console dev)]
  end

  UI --> API
  API --> Auth
  Auth --> DB
  API --> Stripe
  Auth --> Email
```

### F7. Diagrama de componentes (software)

```mermaid
flowchart LR
  Web[apps/web] --> Auth[@culebra/auth]
  Web --> DB[@culebra/db (Prisma)]
  Auth --> Stripe[Stripe SDK]
  Auth --> Email[Email provider]
  Auth --> Storage[Assets/Storage si aplica]
```

---

## G. Anexos sugeridos (opcional)

- Guía de pruebas end-to-end (incluye sandbox).
- Checklist de despliegue para producción.
- Plantillas de UAT para el Grupo Piloto.

