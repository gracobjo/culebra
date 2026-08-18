# Pedidos

## Estado

FASE 7 completada: seguimiento de pedidos para el comprador y gestion logistica por productor.

## Flujo del consumidor

1. Tras el checkout, el pedido aparece en `/pedido/[orderNumber]`.
2. Con cuenta: historial en `/cuenta/pedidos`.
3. Como invitado: consulta en `/pedido/consultar` con numero y email.

El pedido unico se divide internamente en `VendorOrder` por productor. El consumidor ve el estado de cada envio.

## Flujo del productor

En `/panel/proveedor/pedidos`:

1. Confirmar
2. Marcar en preparacion
3. Registrar envio (transportista y tracking opcionales)
4. Marcar entregado

Si cancela antes de enviar, se restaura el stock.

## Estados

Pedido (`Order`):

- `PAYMENT_PENDING` (hasta FASE 8)
- `PARTIALLY_SHIPPED` / `SHIPPED` / `DELIVERED`
- `CANCELLED`

Subpedido (`VendorOrder`):

- `PENDING` → `CONFIRMED` → `IN_PREPARATION` → `SHIPPED` → `DELIVERED`

El estado del pedido padre se calcula a partir de los subpedidos.

## Siguiente fase

FASE 9: contratos versionados.
