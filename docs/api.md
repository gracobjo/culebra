# API

## Estado

FASE 8: autenticacion, proveedores, catalogo, carrito, pedidos y pagos Stripe.

## Base URL

`http://localhost:4000`

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

## Autenticacion

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

- Pagos Stripe (FASE 8)
- Contratos y comisiones
