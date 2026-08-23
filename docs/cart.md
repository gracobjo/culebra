# Carrito y checkout

![Logo Sabores de la Culebra](./imagenes/logo.png)


## Estado

FASE 6 completada: carrito con invitado, checkout con datos de envio/facturacion y pedido interno dividido por productor.

**Desglose por productor (A.3):** en `/carrito` las líneas se agrupan por vendedor con subtotal por productor; el pedido confirmado mantiene el seguimiento por `VendorOrder`.

## Extension: cupones, afiliacion (`?ref=`), packs (añaden lineas de producto). La **noche de alojamiento no entra en el carrito**.

## Envio (tarifa plana)

Regla programada (`computeShippingQuote`):

| Merchandise | Cliente paga |
|-------------|-------------:|
| Cualquier importe &gt; 0 | **6,50 €** (tarifa plana) |
| Carrito vacío | **0 €** |

Constantes en `@culebra/domain`: `CUSTOMER_SHIPPING_FEE_EUR` (6,50 €). `FREE_SHIPPING_THRESHOLD_EUR` queda deprecado (sin umbral de gratuidad).

**Quién paga el porte:** siempre el cliente. La S.L. **no absorbe** etiquetas. Comisión por defecto **17 %** (+ mínimo **4 €** por subpedido de productor).

En carrito/checkout se muestra la tarifa plana. `Order.shippingAmount` + `Order.totalAmount` incluyen el cargo al cliente.

## Carrito

- Usuario autenticado: carrito ligado a `userId`
- Invitado: cookie `culebra_cart` (`sessionId`)
- Si un invitado inicia sesion, se fusionan los carritos (incluido `couponCode` si aplica)
- Snapshot de precio e IVA al anadir
- Campos de total: `subtotal`, `discountAmount`, `total`, `couponCode`

### Cupones

- Aplicar / quitar en `/carrito` (`applyCartCoupon` / `clearCartCoupon`)
- Tipos: `PERCENTAGE` | `FIXED`
- Validacion: activo, fechas, maximo de usos, minimo de pedido
- Al checkout: `Order.discountAmount`, `Order.couponCode`, `CouponRedemption`, pago por el total descontado

### Packs

- `addPackToCart(slug)` añade cada `TourismPackItem` como productos del carrito
- Si el pack tiene cupon asociado, se intenta aplicar al carrito

### Afiliacion

- Middleware guarda `?ref=CODIGO` en cookie `culebra_ref`
- Checkout copia el codigo a `Order.affiliateCode` si el afiliado esta activo
- No altera el split de comision agro; es trazabilidad / atribucion

## Checkout

Obligatorio recoger:

- email, telefono, nombre y apellidos
- direccion de envio
- direccion de facturacion (o la misma)

Opcional: cupon (desde carrito) y afiliado (cookie / campo oculto).

El pedido queda en `PAYMENT_PENDING` hasta el pago Stripe (FASE 8).

## Pedido interno

- `Order` unico para el consumidor
- `VendorOrder` por productor
- `Payment` en estado pendiente (importe = total tras descuento)
- stock descontado al confirmar

## URLs

- `/carrito`
- `/checkout`
- `/pedido/[orderNumber]`
- `/pedido/consultar`
- `/cuenta/pedidos`
