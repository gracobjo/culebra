# Testing

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)


## Estado

FASE 15 completada: suite automatizada con Vitest para dominio, validaciones y API.

## Stack

- **Vitest** en la raiz del monorepo
- Tests unitarios en `packages/auth` y `apps/web`
- Tests de API con `fastify.inject()` en `apps/api`

## Ejecutar

```bash
# Toda la suite
npm test

# Modo watch
npm run test:watch

# Solo auth
npm run test --workspace @culebra/auth

# Solo API
npm run test --workspace @culebra/api
```

## Cobertura actual

| Area | Que valida |
|------|------------|
| RBAC | `hasRole`, `hasAnyRole`, `hasAllRoles` |
| Slugs | normalizacion y unicidad |
| Schemas auth | registro, login, contrasena |
| Schemas carrito/checkout | cantidades y flujo minimo de compra |
| Password/JWT/Token | hash, firma y utilidades criptograficas |
| SEO web | URLs canonicas y JSON-LD |
| API | health, validaciones, auth admin y carrito invitado |

## Notas

- Los tests de API no requieren levantar el servidor; usan `buildApp()` exportado desde `apps/api/src/app.ts`.
- `/health` funciona con o sin base de datos (estado `ok` o `degraded`).
- Tests de integracion con PostgreSQL real quedan para ampliar en fases posteriores.

## Siguiente fase

Roadmap MVP completado. Mejoras opcionales: MFA, emails reales, CI/CD, integracion E2E con PostgreSQL.
