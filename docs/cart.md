# Carrito y checkout

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)


## Estado

FASE 6 completada: carrito con invitado, checkout con datos de envio/facturacion y pedido interno dividido por productor.

## Extension: cupones, afiliacion (`?ref=`), packs (añaden lineas de producto). La **noche de alojamiento no entra en el carrito**.

## Envio (umbral gratuito)

Regla programada (`computeShippingQuote`):

| Merchandise (subtotal − cupón) | Cliente paga |
|--------------------------------|-------------:|
| &lt; **49 €** | **4,95 €** de envío |
| ≥ **49 €** | **Gratis** |

Constantes en `@culebra/domain`: `FREE_SHIPPING_THRESHOLD_EUR`, `CUSTOMER_SHIPPING_FEE_EUR`, `MARKETPLACE_SHIPPING_COST_EUR` (~5 € coste interno orientativo).

**Quién sufraga el envío gratis:** la S.L. lo absorbe desde su comisión (~15 %). El productor **no** pierde neto: sigue recibiendo su 85 % sobre el bruto de producto. El envío cobrado al cliente (&lt;49 €) es ingreso/passthrough logístico de la plataforma, no del productor.

En carrito/checkout se muestra “te faltan X € para envío gratis”. `Order.shippingAmount` + `Order.totalAmount` incluyen el cargo al cliente.

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
