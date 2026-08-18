# Seguridad

## Estado

FASE 13 completada: hardening de API, web, sesiones y auditoria administrativa.

## Autenticacion

- Hash de contrasenas con **bcrypt** (12 rondas)
- Sesiones en base de datos (`UserSession`) con token aleatorio hasheado (SHA-256)
- Cookie httpOnly `culebra_session` para clientes REST
- Cookie httpOnly `culebra_cart` para carrito de invitado
- Cookie httpOnly `culebra_last_order` para confirmar el pedido reciente del invitado
- JWT firmado con `AUTH_SECRET` para integracion web/API
- Auth.js (NextAuth v5) en frontend con provider Credentials
- Usuarios `SUSPENDED` o no `ACTIVE` no pueden autenticarse ni mantener sesion
- Al suspender un usuario se revocan todas sus sesiones API

## RBAC

Roles definidos:

- `ADMIN`
- `VENDOR`
- `CONSUMER`

Middleware de API:

- `authenticate` — valida cookie de sesion o Bearer JWT
- `requireRoles(...)` — autoriza por rol
- JWT y sesiones rechazan usuarios no activos via `getActiveUserById`

Middleware web (`apps/web/src/middleware.ts`):

- `/cuenta/*`, `/panel/proveedor/*` y `/admin/*` requieren sesion
- `/admin/*` requiere rol `ADMIN`
- Cuentas suspendidas redirigen a login

## Protecciones activas

- Validacion de inputs con Zod
- Rate limiting por scope:
  - Global: 100 req/min (configurable)
  - Auth: 10 req/min
  - Carrito/checkout: 40 req/min
  - Admin: 60 req/min
  - Webhooks Stripe: sin limite
- `@fastify/helmet` en API (headers de seguridad)
- Headers de seguridad en Next.js (`next.config.ts`)
- CORS restringido a `CORS_ORIGIN`
- Limite de body HTTP (1 MB) en API
- `trustProxy` en produccion o con `TRUST_PROXY=true`
- Cookies `secure` en produccion
- Verificacion de origen en acciones admin (`assertSameOriginRequest`)
- Auditoria en registro, login, logout, reset, cambios de estado y operaciones admin
- Panel `/admin/auditoria` y endpoint `GET /admin/audit-logs`
- Campo `mfaEnabled` preparado para MFA futuro

## Pendiente (fases posteriores)

- MFA real
- CSRF explicito en formularios publicos adicionales (Next.js ya valida origen en server actions)
- Envio real de emails para reset de contrasena
- WAF / proteccion DDoS a nivel de infraestructura

## Variables sensibles

Nunca commitear:

- `AUTH_SECRET`
- `SEED_ADMIN_PASSWORD`
- credenciales de base de datos
- claves Stripe

## Variables de rate limiting (opcionales)

- `RATE_LIMIT_GLOBAL_MAX`
- `RATE_LIMIT_AUTH_MAX`
- `RATE_LIMIT_CART_MAX`
- `RATE_LIMIT_ADMIN_MAX`
- `TRUST_PROXY`
