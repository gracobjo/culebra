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
| `/admin/contratos` | Crear versiones y enviar a firma |
| `/admin/pedidos` | Consultar pedidos de la plataforma |
| `/admin/liquidaciones` | Payouts a productores |
| `/admin/usuarios` | Suspender o reactivar cuentas |

Las reglas de comision se crean en la ficha del productor (`/admin/productores/:id`).

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
