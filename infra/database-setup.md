# Configuracion de base de datos (FASE 2)

## Requisitos

- Docker Desktop (recomendado) o PostgreSQL 16 local
- Conexion a internet (Prisma descarga binarios en la primera ejecucion)

## Pasos

```powershell
# Desde la raiz del proyecto
Copy-Item .env.example .env
Copy-Item packages\db\.env.example packages\db\.env

# Levantar PostgreSQL
npm run docker:up

# Generar cliente Prisma (requiere red)
npm run db:generate

# Aplicar migracion inicial
npm run db:migrate:deploy

# Seed de roles y categorias
npm run db:seed

# Verificar
npm run db:check
```

## Migracion incluida

- `packages/db/prisma/migrations/20250818120000_init/`

## Prisma Studio

```bash
npm run db:studio
```

## Solucion de problemas

### Docker no encontrado

Instalar Docker Desktop o apuntar `DATABASE_URL` a una instancia PostgreSQL existente.

### Error descargando binarios Prisma

Comprobar conexion a `https://binaries.prisma.sh` y reintentar `npm run db:generate`.

### Puerto 5432 ocupado

Cambiar el puerto en `docker-compose.yml` y actualizar `DATABASE_URL` en `.env`.
