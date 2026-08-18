# Pagos Stripe

## Estado

FASE 8 completada: Checkout de Stripe, webhook y Stripe Connect Express para productores.

## Cobro al cliente

Tras el checkout, si `STRIPE_SECRET_KEY` es una clave `sk_...`:

1. Se crea una Stripe Checkout Session.
2. El cliente paga en Stripe.
3. El webhook marca `Payment` como `PAYMENT_PAID` y el `Order` como `PAID`.
4. Se crean `Payout` por productor.

Si Stripe no esta configurado, el pedido queda en `PAYMENT_PENDING` (modo desarrollo).

## Split a productores

Si el productor tiene cuenta Connect con cobros activos, se crea un `Transfer` al `stripeAccountId` con `transfer_group` = numero de pedido.

Si no ha completado el alta, el `Payout` queda `PENDING` y se reintenta desde `/panel/proveedor/liquidaciones` o al completar Stripe Connect.

Comision marketplace: se calcula en checkout (FASE 10) y se guarda como snapshot. El transfer a Stripe usa `vendorNetAmount`.

## Alta del productor

`/panel/proveedor/pagos` inicia Account Link de Stripe Express.

## Webhooks

- Web: `POST /api/stripe/webhook`
- API: `POST /webhooks/stripe`

Eventos: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`.

## Siguiente fase

FASE 11: panel de administracion.
