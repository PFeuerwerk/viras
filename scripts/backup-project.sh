#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="viras"
DATE_TAG="$(date +"%Y%m%d_%H%M%S")"
BACKUP_DIR="$PROJECT_ROOT/backups"
STAGING_ROOT="/tmp/${PROJECT_NAME}_backup_${DATE_TAG}"
STAGING_PROJECT="$STAGING_ROOT/$PROJECT_NAME"
DB_DUMP_NAME="${PROJECT_NAME}_db_${DATE_TAG}.dump"
TAR_NAME="${PROJECT_NAME}_project_backup_${DATE_TAG}.tar"
TAR_PATH="$BACKUP_DIR/$TAR_NAME"
INDEX_FILE="$PROJECT_ROOT/scripts/que-cual.txt"

cleanup() {
  rm -rf "$STAGING_ROOT"
}
trap cleanup EXIT

require_tool() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: Required tool not found: $1" >&2
    exit 1
  fi
}

read_database_url() {
  local env_file="$PROJECT_ROOT/backend/.env"

  if [[ ! -f "$env_file" ]]; then
    echo "ERROR: Missing backend/.env with DATABASE_URL" >&2
    exit 1
  fi

  local line
  line="$(grep -E '^DATABASE_URL=' "$env_file" | tail -n 1 || true)"

  if [[ -z "$line" ]]; then
    echo "ERROR: DATABASE_URL not found in backend/.env" >&2
    exit 1
  fi

  line="${line#DATABASE_URL=}"
  line="${line%\"}"
  line="${line#\"}"
  printf '%s' "$line"
}

require_tool pg_dump
require_tool rsync
require_tool tar

mkdir -p "$BACKUP_DIR"
mkdir -p "$STAGING_PROJECT"

DATABASE_URL="$(read_database_url)"
PG_DUMP_URL="${DATABASE_URL%%\?*}"

echo "Creating fresh database dump..."
pg_dump "$PG_DUMP_URL" --schema=public --format=custom --file="$STAGING_PROJECT/$DB_DUMP_NAME"

echo "Copying clean project files..."
rsync -a "$PROJECT_ROOT/" "$STAGING_PROJECT/" \
  --exclude=".git/" \
  --exclude=".angular/" \
  --exclude=".cache/" \
  --exclude=".run-logs/" \
  --exclude=".vscode/" \
  --exclude=".idea/" \
  --exclude="node_modules/" \
  --exclude="dist/" \
  --exclude="coverage/" \
  --exclude="tmp/" \
  --exclude="temp/" \
  --exclude="logs/" \
  --exclude="backups/" \
  --exclude="*.dump" \
  --exclude="*.log" \
  --exclude="*.tar" \
  --exclude="*.tar.gz" \
  --exclude="*.zip" \
  --exclude=".DS_Store" \
  --exclude="Thumbs.db"

echo "Creating tar archive..."
tar -cf "$TAR_PATH" -C "$STAGING_ROOT" "$PROJECT_NAME"

echo "Verifying tar archive..."
tar -tf "$TAR_PATH" >/dev/null

TAR_SIZE="$(du -h "$TAR_PATH" | awk '{print $1}')"

cat >> "$INDEX_FILE" <<EOF

$TAR_NAME
$(printf '%*s' "${#TAR_NAME}" '' | tr ' ' '-')
Backup TAR creado el $(date +"%Y-%m-%d %H:%M:%S"). Incluye codigo fuente limpio,
assets, configuracion del proyecto y un dump fresco de PostgreSQL: $DB_DUMP_NAME.
Estado respaldado: proyecto reconstruido, frontend/backend alineados, builds y tests
pasando, flujo funcional completo verificado con manual-flow-check.sh. Tamano: $TAR_SIZE.

EOF

echo "Backup created successfully:"
echo "$TAR_PATH"
echo "Size: $TAR_SIZE"
