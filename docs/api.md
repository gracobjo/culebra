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

- Proveedores
- Catalogo y productos
- Pedidos y pagos
