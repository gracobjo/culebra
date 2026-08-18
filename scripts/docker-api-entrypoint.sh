#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Aplicando migraciones de base de datos..."
  npm run db:migrate:deploy
fi

echo "Iniciando API..."
exec node apps/api/dist/server.js
