param(
  [string]$ContainerName = "culebra-postgres-prod",
  [string]$BackupDir = "infra/backups",
  [string]$PostgresUser = "postgres",
  [string]$PostgresDb = "culebra"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $BackupDir "culebra-$timestamp.sql.gz"

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

Write-Host "Creando backup en $backupFile..."
docker exec $ContainerName pg_dump -U $PostgresUser $PostgresDb | gzip > $backupFile
Write-Host "Backup completado."
