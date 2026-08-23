# API

![Logo Sabores de la Culebra](./imagenes/logo.png)


## Estado

FASE 11: autenticacion, proveedores, catalogo, carrito, pedidos, pagos, contratos, comisiones y panel admin.

## Base URL

`http://localhost:4000`

## Documentacion interactiva (Swagger)

Con la API en marcha (`npm run dev:api`):

| Recurso | URL |
|---------|-----|
| Swagger UI | `http://localhost:4000/docs` |
| OpenAPI JSON | `http://localhost:4000/docs/json` |

Por defecto Swagger esta **activo en desarrollo** y **desactivado en produccion**.
Para habilitarlo en produccion: `ENABLE_SWAGGER=true` en el entorno de la API.

La especificacion OpenAPI vive en `apps/api/src/openapi/spec.ts`.

## Endpoints publicos

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/health` | Estado del servicio y base de datos |
| POST | `/auth/register` | Registro de consumidor |
| POST | `/auth/login` | Inicio de sesion |
| POST | `/auth/password-reset/request` | Solicitud de reset (email pendiente) |

## Endpoints autenticados

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/auth/me` | Usuario autenticado |
| POST | `/auth/logout` | Cierre de sesion |

## Endpoints RBAC (ejemplo)

| Metodo | Ruta | Rol requerido |
|--------|------|---------------|
| GET | `/admin/status` | ADMIN |
| GET | `/vendor/status` | VENDOR |
| GET | `/consumer/status` | CONSUMER |

## Proveedores

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

## Catalogo y productos

| Metodo | Ruta | Acceso |
|--------|------|--------|
| GET | `/categories` | Publico |
| GET | `/products` | Publico |
| GET | `/products/:slug` | Publico |
| GET | `/vendors/me/products` | VENDOR |
| GET | `/vendors/me/products/:id` | VENDOR |
| POST | `/vendors/me/products` | VENDOR |
| PATCH | `/vendors/me/products/:id` | VENDOR |
| POST | `/vendors/me/products/:id/submit` | VENDOR |
| POST | `/vendors/me/products/:id/disable` | VENDOR |
| GET | `/admin/products` | ADMIN |
| PATCH | `/admin/products/:id/status` | ADMIN |

## Carrito y checkout

| Metodo | Ruta | Acceso |
|--------|------|--------|
| GET | `/cart` | Publico / sesion |
| POST | `/cart/items` | Publico / sesion |
| PATCH | `/cart/items/:id` | Publico / sesion |
| DELETE | `/cart/items/:id` | Publico / sesion |
| POST | `/checkout` | Publico / sesion |

## Pedidos

| Metodo | Ruta | Acceso |
|--------|------|--------|
| GET | `/orders` | Autenticado |
| GET | `/orders/:orderNumber` | Autenticado (propietario) |
| POST | `/orders/lookup` | Publico (numero + email) |
| GET | `/vendors/me/orders` | VENDOR |
| GET | `/vendors/me/orders/:id` | VENDOR |
| PATCH | `/vendors/me/orders/:id/status` | VENDOR |
| POST | `/vendors/me/orders/:id/ship` | VENDOR |

## Pagos

| Metodo | Ruta | Acceso |
|--------|------|--------|
| POST | `/orders/:orderNumber/pay` | Autenticado |
| GET | `/vendors/me/stripe` | VENDOR |
| POST | `/vendors/me/stripe/onboard` | VENDOR |
| POST | `/webhooks/stripe` | Stripe (firma) |

## Contratos

| Metodo | Ruta | Acceso |
|--------|------|--------|
| GET | `/vendors/me/contracts` | VENDOR |
| POST | `/vendors/me/contracts/versions/:versionId/accept` | VENDOR |
| GET | `/admin/contracts` | ADMIN |
| GET | `/admin/contracts/:id` | ADMIN |
| POST | `/admin/vendors/:vendorId/contracts/versions` | ADMIN |
| POST | `/admin/contracts/:contractId/versions/:versionId/publish` | ADMIN |

## Comisiones y liquidaciones

| Metodo | Ruta | Acceso |
|--------|------|--------|
| GET | `/vendors/me/commission-rules` | VENDOR |
| GET | `/vendors/me/payouts` | VENDOR |
| POST | `/vendors/me/payouts/retry` | VENDOR |
| GET | `/admin/vendors/:vendorId/commission-rules` | ADMIN |
| POST | `/admin/vendors/:vendorId/commission-rules` | ADMIN |
| GET | `/admin/payouts` | ADMIN |

## Panel admin

| Metodo | Ruta | Acceso |
|--------|------|--------|
| GET | `/admin/dashboard` | ADMIN |
| GET | `/admin/users` | ADMIN |
| PATCH | `/admin/users/:id/status` | ADMIN |
| GET | `/admin/orders` | ADMIN |
| GET | `/admin/orders/:orderNumber` | ADMIN |
| GET | `/admin/audit-logs` | ADMIN |

## Documentacion Swagger

Ver seccion anterior: interfaz en `/docs` cuando `ENABLE_SWAGGER` lo permite.

Dos metodos soportados:

1. Cookie httpOnly `culebra_session` (respuesta de login/register)
2. Header `Authorization: Bearer <accessToken>`

## Ejemplo registro

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password1","firstName":"Ana"}'
```

## Siguientes modulos

- UX/UI del marketplace (FASE 12)
