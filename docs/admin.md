# Panel de administracion

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)


## Estado

FASE 11 completada: panel web para moderar productores, productos, contratos, pedidos, liquidaciones y usuarios.

## Acceso

Solo usuarios con rol `ADMIN`. Ruta: `/admin`.

Crear el primer admin con `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` en `.env` y `npm run db:seed`.

## Modulos

| Ruta | Funcion |
|------|---------|
| `/admin` | Resumen de pendientes |
| `/admin/productores` | Aprobar, rechazar o suspender |
| `/admin/productos` | Publicar o rechazar fichas |
| `/admin/turismo` | Alojamientos, packs, cupones y afiliados |
| `/admin/contratos` | Crear versiones y enviar a firma |
| `/admin/pedidos` | Consultar pedidos de la plataforma |
| `/admin/liquidaciones` | Payouts a productores |
| `/admin/usuarios` | Suspender o reactivar cuentas |
| `/admin/kpis` | KPIs artesanos |
| `/admin/rentabilidad` | Rentabilidad por transaccion |
| `/admin/rappels` | Rappels teoricos |
| `/admin/piloto` | Grupo piloto |
| `/admin/sandbox` | Simulacion end-to-end |

Las reglas de comision se gestionan en la ficha del productor (`/admin/productores/:id`):

- **Comision por defecto de la plataforma:** 15 %.
- Al **aprobar** un productor (`ACTIVE`) se crea regla al 15 % si no tenia ninguna.
- Para **subir o bajar** la comision: introduce el nuevo % y pulsa *Actualizar comision (%)*. Solo aplica a pedidos futuros.

Ver detalle en `docs/commissions.md`.

## Turismo (admin)

En `/admin/turismo` se gestionan entidades que **no** pasan por el checkout de noches:

- Alojamientos publicados en `/alojamientos` (URL de reserva externa + productos relacionados).
- Packs (`/packs`): lote = productos del carrito; noche = enlace al alojamiento.
- Cupones y codigos de afiliado (`?ref=`).

Ver `docs/tourism.md`.

## API extra

| Metodo | Ruta |
|--------|------|
| GET | `/admin/dashboard` |
| GET | `/admin/users` |
| PATCH | `/admin/users/:id/status` |
| GET | `/admin/orders` |
| GET | `/admin/orders/:orderNumber` |

## Siguiente fase

FASE 12: UX/UI del marketplace (navegacion, fichas, confianza y conversion).
