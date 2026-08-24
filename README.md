# Sierra de la Culebra Marketplace

![Logo Sabores de la Culebra](docs/imagenes/logo.png)

Marketplace multi-vendedor especializado en productos tradicionales y agroalimentarios de la Sierra de la Culebra y su entorno.

## Estado

Proyecto en **FASE 16**: despliegue Docker de produccion (MVP completo).

## Stack

- `apps/web`: Next.js + TypeScript + Tailwind CSS
- `apps/api`: Node.js + TypeScript + Fastify
- `packages/db`: PostgreSQL + Prisma
- `packages/domain`: tipos de dominio compartidos
- `packages/shared`: utilidades compartidas

## Estructura

```text
apps/
  web/
  api/
packages/
  db/
  domain/
  shared/
docs/
infra/
scripts/
docker-compose.yml
```

## Requisitos

- Node.js 20+
- Docker (para PostgreSQL local)
- npm 10+

## Inicio rapido

```bash
# 1. Variables de entorno
cp .env.example .env
cp packages/db/.env.example packages/db/.env

# 2. Dependencias
npm install

# 3. Base de datos
npm run docker:up
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Desarrollo
npm run dev:web   # http://localhost:3000
npm run dev:api   # http://localhost:4000
```

## Scripts

| Script | Descripcion |
|--------|-------------|
| `npm run dev:web` | Frontend Next.js |
| `npm run dev:api` | API Fastify |
| `npm run build` | Build de todos los workspaces |
| `npm run lint` | Lint |
| `npm run typecheck` | Verificacion de tipos |
| `npm test` | Tests automatizados (Vitest) |
| `npm run test:watch` | Tests en modo watch |
| `npm run docker:up` | Levantar PostgreSQL |
| `npm run docker:down` | Parar PostgreSQL |
| `npm run docker:prod:build` | Build imagenes Docker produccion |
| `npm run docker:prod:up` | Levantar stack produccion |
| `npm run docker:prod:down` | Parar stack produccion |
| `npm run docker:backup` | Backup PostgreSQL |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:migrate` | Migraciones (dev) |
| `npm run db:seed` | Seed roles + categorias |
| `npm run db:check` | Verificar conexion DB |
| `npm run db:studio` | Prisma Studio |

## Variables de entorno

Revisar `.env.example` (desarrollo) y `.env.production.example` (produccion).

## Notas legales

Los textos juridicos deben tratarse como placeholders hasta revision profesional:

- `[REVISAR CON ABOGADO]`

## Roadmap

- [x] FASE 1: Estructura del proyecto
- [x] FASE 2: Base de datos
- [x] FASE 3: Autenticacion y roles
- [x] FASE 4: Proveedores
- [x] FASE 5: Productos y catalogo
- [x] FASE 6: Marketplace y carrito
- [x] FASE 7: Pedidos
- [x] FASE 8: Pagos
- [x] FASE 9: Contratos
- [x] FASE 10: Comisiones y liquidaciones
- [x] FASE 11: Panel de administracion
- [x] FASE 12: UX/UI del marketplace
- [x] FASE 13: Seguridad
- [x] FASE 14: SEO
- [x] FASE 15: Testing
- [x] FASE 16: Deploy
