# Carrito y checkout

## Estado

FASE 6 completada: carrito con invitado, checkout con datos de envio/facturacion y pedido interno dividido por productor.

## Carrito

- Usuario autenticado: carrito ligado a `userId`
- Invitado: cookie `culebra_cart` (`sessionId`)
- Si un invitado inicia sesion, se fusionan los carritos
- Snapshot de precio e IVA al anadir

## Checkout

Obligatorio recoger:

- email, telefono, nombre y apellidos
- direccion de envio
- direccion de facturacion (o la misma)

El pedido queda en `PAYMENT_PENDING` hasta el pago Stripe (FASE 8).

## Pedido interno

- `Order` unico para el consumidor
- `VendorOrder` por productor
- `Payment` en estado pendiente
- stock descontado al confirmar

## URLs

- `/carrito`
- `/checkout`
- `/pedido/[orderNumber]`
- `/pedido/consultar`
- `/cuenta/pedidos`

## Siguiente fase

FASE 9: contratos versionados.
