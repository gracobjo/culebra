# Despliegue

![Logo Sabores de la Culebra](./imagenes/logo_sabores_culebra.png)


## Estado

FASE 16 completada: empaquetado Docker, compose de produccion y backups de PostgreSQL.

## Arquitectura de produccion

```text
Internet
   |
   +-- Web (Next.js standalone) :3000
   |
   +-- API (Fastify) :4000
           |
           +-- PostgreSQL 16
```

Recomendacion en cloud: colocar un reverse proxy (Caddy, Nginx, Traefik) delante con TLS y apuntar:

- `https://tu-dominio.com` -> web
- `https://api.tu-dominio.com` -> api

Activa `TRUST_PROXY=true` cuando la API este detras de proxy.

## Requisitos

- Docker 24+
- Docker Compose v2
- Dominio y certificados TLS (en el proxy o proveedor cloud)

## Primer despliegue

```powershell
# 1. Variables de produccion
Copy-Item .env.production.example .env.production
# Editar AUTH_SECRET, POSTGRES_PASSWORD, URLs y claves Stripe/S3

# 2. Construir imagenes
npm run docker:prod:build

# 3. Levantar stack
npm run docker:prod:up

# 4. Verificar
curl http://localhost:4000/health
curl http://localhost:3000/
```

La API aplica migraciones Prisma al arrancar (`RUN_MIGRATIONS=true`).

## Servicios

| Servicio | Contenedor | Puerto host |
|----------|------------|-------------|
| PostgreSQL | `culebra-postgres-prod` | interno |
| API | `culebra-api-prod` | 4000 |
| Web | `culebra-web-prod` | 3000 |

## Scripts npm

| Script | Descripcion |
|--------|-------------|
| `npm run docker:prod:build` | Build de imagenes web + api |
| `npm run docker:prod:up` | Levantar stack produccion |
| `npm run docker:prod:down` | Parar stack produccion |
| `npm run docker:backup` | Backup PostgreSQL (PowerShell) |

Backup en Linux/macOS:

```bash
sh scripts/backup-db.sh
```

Los dumps se guardan en `infra/backups/`.

## Desarrollo vs produccion

| Entorno | Compose | Uso |
|---------|---------|-----|
| Desarrollo | `docker-compose.yml` | Solo PostgreSQL local |
| Produccion | `docker-compose.prod.yml` | Postgres + API + Web |

## Variables clave (`.env.production`)

- `POSTGRES_PASSWORD` — obligatoria
- `AUTH_SECRET` — secreto largo aleatorio
- `AUTH_URL` / `NEXT_PUBLIC_APP_URL` — URL publica web
- `NEXT_PUBLIC_API_URL` — URL publica API
- `CORS_ORIGIN` — debe coincidir con la web
- Claves Stripe y S3 para pagos y assets

Ver `.env.production.example`.

## Cloud economica (referencia)

Opciones habituales de bajo coste:

- **VPS** (Hetzner, OVH, DigitalOcean): Docker Compose + Caddy
- **Railway / Render / Fly.io**: desplegar imagenes por servicio
- **Managed Postgres** (Neon, Supabase, RDS): sustituir servicio `postgres` y ajustar `DATABASE_URL`

## Backups y restauracion

Backup:

```powershell
npm run docker:backup
```

Restaurar (ejemplo):

```powershell
gunzip -c infra/backups/culebra-YYYYMMDD-HHMMSS.sql.gz | docker exec -i culebra-postgres-prod psql -U postgres -d culebra
```

Programar backups diarios con cron o Task Scheduler apuntando a `scripts/backup-db.sh` / `.ps1`.

## Healthchecks

- API: `GET /health`
- Web: `GET /`

Docker Compose espera API saludable antes de levantar web.

## Notas

- No commitear `.env.production`.
- El seed de admin solo debe usarse en bootstrap inicial controlado.
- Revisar limites de rate limiting y firewall del VPS.
