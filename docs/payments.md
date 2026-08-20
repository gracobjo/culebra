# Pagos y liquidaciones a productores

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)


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

El productor elige en `/panel/proveedor/pagos`:

- **Stripe Connect Express** — transferencia bancaria vía cuenta conectada.
- **PayPal** — liquidaciones al email PayPal del productor (API Payouts).

Si el productor tiene el metodo configurado y activo, tras la retencion de 14 dias se ejecuta el payout (Stripe Transfer o PayPal Payout).

Si no ha completado el alta, el `Payout` queda `PENDING` y se reintenta desde `/panel/proveedor/liquidaciones` o al completar la configuracion.

Comision marketplace: por defecto **17%** (`DEFAULT_MARKETPLACE_COMMISSION_PERCENT`). El admin puede subir o bajar el porcentaje por productor en `/admin/productores/:id`. Los contratos nuevos incluyen 15% si no se indica otro valor.

## Alta del productor (Stripe)

`/panel/proveedor/pagos` → pestaña Stripe Connect. Las cuentas conectadas se crean con **Connect Accounts v2** (`POST /v2/core/accounts`, dashboard Express, capability `stripe_transfers`).

Las cuentas Stripe nuevas ya no admiten Accounts v1; no hace falta activar soporte v1 en el Dashboard si usas esta version de la app.

En el [Dashboard de Stripe (test)](https://dashboard.stripe.com/test/settings/connect) completa el perfil de plataforma Connect si te lo pide al crear la primera cuenta conectada.

## Alta del productor (PayPal)

`/panel/proveedor/pagos` → pestaña PayPal → email de la cuenta receptora.

Variables de entorno: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE=sandbox|live`.

En sandbox, crea una app REST en [PayPal Developer](https://developer.paypal.com/dashboard/applications/sandbox) y activa **Payouts**. El productor puede usar una cuenta personal o business de prueba.

El cobro al cliente sigue siendo Stripe; PayPal solo se usa para marketplace → productor.

## Webhooks

- Web: `POST /api/stripe/webhook`
- API: `POST /webhooks/stripe`

Eventos: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`.

## Siguiente fase

FASE 12: UX/UI del marketplace.
