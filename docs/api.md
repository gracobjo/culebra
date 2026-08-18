# API

## Estado

FASE 3 completada: autenticacion, sesiones y RBAC base.

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

- Pedidos y pagos
- Contratos y comisiones
