# Turismo territorial (fases 2–3)

![Logo Sabores de la Culebra](./imagenes/logo.png)

## Principio de diseno

El nucleo del expediente y del checkout es **agroalimentario**.

| Que | Donde se resuelve |
|-----|-------------------|
| Productos / packs (lote) | Carrito + Stripe |
| Noche / estancia | Enlace externo (Booking, web, WhatsApp, telefono, email) |

No se modela el alojamiento como `Vendor` de checkout.

**Decisión piloto:** se vende el **lote gourmet** (carrito + comisión marketplace). Noche / experiencia = enlace externo, sin asumir reserva ni portes del pack. Ver [`Flujo_Operativo_Piloto.md`](./Flujo_Operativo_Piloto.md) §11.

## Modelos Prisma

- `Accommodation`, `AccommodationProduct`
- `TourismPack`, `TourismPackItem`
- `Coupon`, `CouponRedemption`
- `AffiliateCode`
- En `Order`: `discountAmount`, `couponCode`, `affiliateCode`
- En `Cart`: `couponCode`

Migracion: `packages/db/prisma/migrations/20260820130000_tourism_module/`

## Servicios (`@culebra/auth`)

- `accommodation.service.ts` / `accommodation.schemas.ts`
- `tourism-pack.service.ts` / `tourism-pack.schemas.ts`
- `coupon.service.ts` / `coupon.schemas.ts`
- `affiliate.service.ts` / `affiliate.schemas.ts`

## Rutas web

| Ruta | Rol |
|------|-----|
| `/tienda` | Hub comarca |
| `/alojamientos` | Directorio publico |
| `/packs` | Packs publicados |
| `/admin/turismo` | Alta/gestion admin |

## Seed de ejemplo

Tras `npm run db:seed` (con migracion aplicada):

- Alojamientos de ejemplo + productos relacionados
- Cupon `SIERRA10`
- Afiliado `CASAFOZ` (`/productos?ref=CASAFOZ`)
- Pack `noche-lote-gourmet-foz`

## Referencias

- Memoria de Proyecto §21.1 (fases turismo)
- Manual de usuario §A2 / §A4.6
- Requisitos RF-15 … RF-20, UC-13 … UC-16
