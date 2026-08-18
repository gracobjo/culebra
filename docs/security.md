# Seguridad

## Estado

FASE 3 completada: autenticacion, sesiones, RBAC y validacion de inputs.

## Autenticacion

- Hash de contrasenas con **bcrypt** (12 rondas)
- Sesiones en base de datos (`UserSession`) con token aleatorio hasheado (SHA-256)
- Cookie httpOnly `culebra_session` para clientes REST
- Cookie httpOnly `culebra_cart` para carrito de invitado
- Cookie httpOnly `culebra_last_order` para confirmar el pedido reciente del invitado
- JWT firmado con `AUTH_SECRET` para integracion web/API
- Auth.js (NextAuth v5) en frontend con provider Credentials

## RBAC

Roles definidos:

- `ADMIN`
- `VENDOR`
- `CONSUMER`

Middleware de API:

- `authenticate` — valida cookie de sesion o Bearer JWT
- `requireRoles(...)` — autoriza por rol

Rutas protegidas de ejemplo:

- `GET /admin/status` — solo ADMIN
- `GET /vendor/status` — solo VENDOR
- `GET /consumer/status` — solo CONSUMER

## Protecciones activas

- Validacion de inputs con Zod
- Rate limiting global (100 req/min) y en auth (10 req/min)
- CORS restringido a `CORS_ORIGIN`
- Auditoria en registro, login, logout y solicitud de reset
- Campo `mfaEnabled` preparado para MFA futuro

## Pendiente (fases posteriores)

- MFA real
- CSRF en formularios web sensibles
- Hardening avanzado (FASE 13)
- Envio real de emails para reset de contrasena

## Variables sensibles

Nunca commitear:

- `AUTH_SECRET`
- `SEED_ADMIN_PASSWORD`
- credenciales de base de datos
