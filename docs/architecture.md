# Arquitectura

## Estado

Monolito modular. FASE 6: web Next.js, API Fastify, Prisma y carrito/checkout en `@culebra/auth`.

## Enfoque

- Monolito modular
- `apps/web` para frontend
- `apps/api` para API REST
- `packages/domain` para tipos y contratos de dominio
- `packages/shared` para utilidades compartidas

## Objetivo

Sentar una base mantenible, escalable y de bajo coste para evolucionar el marketplace multi-vendedor por fases.
