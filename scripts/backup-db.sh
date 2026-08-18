#!/bin/sh
set -euo pipefail

CONTAINER_NAME="${POSTGRES_CONTAINER:-culebra-postgres-prod}"
BACKUP_DIR="${BACKUP_DIR:-./infra/backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/culebra-${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "Creando backup en ${BACKUP_FILE}..."
docker exec "${CONTAINER_NAME}" pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-culebra}" | gzip > "${BACKUP_FILE}"

echo "Backup completado."
