# Arquitectura

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)


## Estado

Monolito modular. Monolito modular. FASE 16: despliegue Docker de produccion.

## Enfoque

- Monolito modular
- `apps/web` para frontend
- `apps/api` para API REST
- `packages/domain` para tipos y contratos de dominio
- `packages/shared` para utilidades compartidas

## Objetivo

Sentar una base mantenible, escalable y de bajo coste para evolucionar el marketplace multi-vendedor por fases.

El nucleo de negocio y de pago es **agroalimentario**. La capa territorial (alojamientos, packs, cupones, afiliacion) se modela aparte: ver [tourism.md](./tourism.md) y [catalog.md](./catalog.md).
