# Gestion de proveedores

![Logo Sabores de la Culebra](./imagenes/logo.png)


## Estado

FASE 4 completada: onboarding, perfil, pagina publica, panel productor y moderacion admin via API.

## Flujo del productor

1. Registro/login como consumidor.
2. Solicitud en `/quiero-vender`.
3. Perfil en estado `DRAFT`.
4. Edicion en `/panel/proveedor`.
5. Envio a revision → `PENDING_REVIEW`.
6. Aprobacion admin → `ACTIVE` (pagina publica visible).

## Estados

- `DRAFT`
- `PENDING_REVIEW`
- `ACTIVE`
- `SUSPENDED`
- `REJECTED`

## API

| Metodo | Ruta | Acceso |
|--------|------|--------|
| GET | `/vendors` | Publico |
| GET | `/vendors/:slug` | Publico |
| POST | `/vendors/apply` | Autenticado |
| GET | `/vendors/me/profile` | VENDOR |
| PATCH | `/vendors/me/profile` | VENDOR |
| POST | `/vendors/me/submit` | VENDOR |
| GET | `/admin/vendors` | ADMIN |
| PATCH | `/admin/vendors/:id/status` | ADMIN |

## Web

- `/quiero-vender` — alta inicial
- `/panel/proveedor` — panel privado
- `/panel/proveedor/pagos` — metodo de cobro (Stripe Connect o PayPal)
- `/panel/proveedor/liquidaciones` — comision efectiva (17 % por defecto), historial y reintento de payouts
- `/productores` — listado publico
- `/productores/[slug]` — ficha publica

### Aviso si falta configurar cobros

En todas las paginas del panel productor aparece una barra ambar si el metodo elegido no esta listo (Stripe sin onboarding o PayPal sin email). Ver `docs/payments.md`.

## Comision del marketplace

Por defecto **17 %** sobre el bruto del productor. El admin puede modificarlo por productor en `/admin/productores/:id`. Detalle en `docs/commissions.md`.

## Moderacion

Solo proveedores `ACTIVE` aparecen en el listado y ficha publica. La moderacion de certificaciones y documentos se implementara en fases posteriores.

## Siguiente fase

FASE 9: contratos versionados.
