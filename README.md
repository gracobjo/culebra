# Sierra de la Culebra Marketplace

Marketplace multi-vendedor especializado en productos tradicionales y agroalimentarios de la Sierra de la Culebra y su entorno.

## Estado

Proyecto en FASE 1: inicializacion de estructura, configuracion base y documentacion inicial.

## Stack previsto

- `apps/web`: Next.js + TypeScript + Tailwind CSS
- `apps/api`: Node.js + TypeScript + API REST
- `database`: PostgreSQL + Prisma
- `storage`: S3 compatible
- `payments`: Stripe Connect o equivalente

## Estructura

```text
apps/
  web/
  api/
packages/
  domain/
  shared/
docs/
infra/
scripts/
```

## Scripts

- `npm run dev:web`
- `npm run dev:api`
- `npm run build`
- `npm run lint`
- `npm run typecheck`

## Variables de entorno

Revisar `.env.example`.

## Notas legales

Los textos juridicos, fiscales y de cumplimiento normativo deben tratarse como placeholders hasta revision profesional:

- `[REVISAR CON ABOGADO]`

## Siguientes fases

1. Base de datos y Prisma
2. Autenticacion y roles
3. Proveedores
4. Catalogo y productos
