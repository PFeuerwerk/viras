#!/usr/bin/env bash
set -euo pipefail

SOURCE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$SOURCE_ROOT/backups"
TARGET_DIR="$HOME/viras-restored"
FORCE="false"
SKIP_DB="false"
SKIP_INSTALL="false"
SKIP_TESTS="false"
DRY_RUN="false"

usage() {
  cat <<'EOF'
Usage:
  scripts/restore-latest-backup.sh [options]

Options:
  --target DIR     Directory where the project will be restored.
                   Default: ~/viras-restored
  --force          Allow replacing an existing target directory.
  --skip-db        Extract project but skip PostgreSQL restore.
  --skip-install   Skip npm ci and Prisma generate.
  --skip-tests     Skip build/test verification.
  --dry-run        Show what would be restored without changing files or DB.
  -h, --help       Show this help.

Environment variables:
  PGADMIN_USER     PostgreSQL admin user used only if the app DB user/DB
                   must be created. Default: postgres
  PGADMIN_HOST     PostgreSQL admin host. Default: DB host from DATABASE_URL
  PGADMIN_PORT     PostgreSQL admin port. Default: DB port from DATABASE_URL
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET_DIR="${2:?Missing value for --target}"
      shift 2
      ;;
    --force)
      FORCE="true"
      shift
      ;;
    --skip-db)
      SKIP_DB="true"
      shift
      ;;
    --skip-install)
      SKIP_INSTALL="true"
      shift
      ;;
    --skip-tests)
      SKIP_TESTS="true"
      shift
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_tool() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: Required tool not found: $1" >&2
    exit 1
  fi
}

latest_backup() {
  if [[ ! -d "$BACKUP_DIR" ]]; then
    echo "ERROR: Backup directory not found: $BACKUP_DIR" >&2
    exit 1
  fi

  local latest
  latest="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name "*.tar" -printf "%T@ %p\n" | sort -nr | awk 'NR==1 {print $2}')"

  if [[ -z "$latest" ]]; then
    echo "ERROR: No .tar backup found in $BACKUP_DIR" >&2
    exit 1
  fi

  printf '%s' "$latest"
}

parse_env_url() {
  local env_file=$1
  local key=$2

  local line
  line="$(grep -E "^${key}=" "$env_file" | tail -n 1 || true)"

  if [[ -z "$line" ]]; then
    return 1
  fi

  line="${line#${key}=}"
  line="${line%\"}"
  line="${line#\"}"
  printf '%s' "$line"
}

emit_db_vars() {
  local database_url=$1

  node - "$database_url" <<'NODE'
const url = new URL(process.argv[2]);
const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
const schema = url.searchParams.get("schema") || "public";
const port = url.port || "5432";

const values = {
  DB_USER: decodeURIComponent(url.username),
  DB_PASS: decodeURIComponent(url.password),
  DB_HOST: url.hostname || "localhost",
  DB_PORT: port,
  DB_NAME: database,
  DB_SCHEMA: schema,
};

for (const [key, value] of Object.entries(values)) {
  console.log(`${key}=${JSON.stringify(value)}`);
}
NODE
}

prepare_target() {
  local target=$1

  if [[ "$target" == "$SOURCE_ROOT" ]]; then
    echo "ERROR: Refusing to restore over the source project directory." >&2
    exit 1
  fi

  if [[ -e "$target" ]]; then
    if [[ "$FORCE" != "true" ]]; then
      echo "ERROR: Target exists: $target" >&2
      echo "Use --force to replace it, or choose another --target." >&2
      exit 1
    fi

    if [[ "$target" == "/" || "$target" == "$HOME" ]]; then
      echo "ERROR: Refusing dangerous target path: $target" >&2
      exit 1
    fi

    rm -rf "$target"
  fi

  mkdir -p "$target"
}

restore_database() {
  local restored_project=$1
  local dump_file=$2
  local env_file="$restored_project/backend/.env"

  if [[ ! -f "$env_file" ]]; then
    echo "ERROR: Restored backend/.env not found; cannot restore DB." >&2
    exit 1
  fi

  local database_url
  database_url="$(parse_env_url "$env_file" "DATABASE_URL")"

  if [[ -z "$database_url" ]]; then
    echo "ERROR: DATABASE_URL not found in restored backend/.env" >&2
    exit 1
  fi

  eval "$(emit_db_vars "$database_url")"

  local shadow_url shadow_db
  shadow_url="$(parse_env_url "$env_file" "SHADOW_DATABASE_URL" || true)"
  shadow_db=""
  if [[ -n "$shadow_url" ]]; then
    shadow_db="$(node - "$shadow_url" <<'NODE'
const url = new URL(process.argv[2]);
console.log(decodeURIComponent(url.pathname.replace(/^\//, "")));
NODE
)"
  fi

  local pg_admin_user="${PGADMIN_USER:-postgres}"
  local pg_admin_host="${PGADMIN_HOST:-$DB_HOST}"
  local pg_admin_port="${PGADMIN_PORT:-$DB_PORT}"

  echo "Checking PostgreSQL connectivity..."

  if ! PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1" >/dev/null 2>&1; then
    echo "App DB user cannot connect yet. Trying to create role/database with admin user: $pg_admin_user"

    psql -h "$pg_admin_host" -p "$pg_admin_port" -U "$pg_admin_user" -d postgres \
      -v ON_ERROR_STOP=1 \
      -v db_user="$DB_USER" \
      -v db_pass="$DB_PASS" \
      -v db_name="$DB_NAME" \
      -v shadow_db="$shadow_db" <<'SQL'
DO $$
DECLARE
  target_role text := :'db_user';
  target_pass text := :'db_pass';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = target_role) THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', target_role, target_pass);
  END IF;
END
$$;

SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'db_user')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db_name') \gexec

SELECT format('CREATE DATABASE %I OWNER %I', :'shadow_db', :'db_user')
WHERE :'shadow_db' <> ''
AND NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'shadow_db') \gexec
SQL
  else
    echo "App DB user connectivity: OK"

    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
      -v ON_ERROR_STOP=1 \
      -v db_name="$DB_NAME" \
      -v shadow_db="$shadow_db" <<'SQL'
SELECT format('CREATE DATABASE %I', :'db_name')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'db_name') \gexec

SELECT format('CREATE DATABASE %I', :'shadow_db')
WHERE :'shadow_db' <> ''
AND NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'shadow_db') \gexec
SQL
  fi

  echo "Restoring PostgreSQL dump into $DB_NAME..."
  PGPASSWORD="$DB_PASS" pg_restore \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --schema="$DB_SCHEMA" \
    --clean \
    --if-exists \
    --no-owner \
    "$dump_file"
}

require_tool tar
require_tool find
require_tool sort
require_tool awk
require_tool node
require_tool npm

if [[ "$SKIP_DB" != "true" ]]; then
  require_tool psql
  require_tool pg_restore
fi

BACKUP_TAR="$(latest_backup)"
BACKUP_NAME="$(basename "$BACKUP_TAR")"
TARGET_DIR="$(mkdir -p "$(dirname "$TARGET_DIR")" && cd "$(dirname "$TARGET_DIR")" && pwd)/$(basename "$TARGET_DIR")"
RESTORE_TMP="/tmp/viras_restore_$(date +"%Y%m%d_%H%M%S")"

echo "Latest backup: $BACKUP_TAR"
echo "Target: $TARGET_DIR"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "Dry run only. No files or database were changed."
  tar -tf "$BACKUP_TAR" | sed -n '1,40p'
  exit 0
fi

rm -rf "$RESTORE_TMP"
mkdir -p "$RESTORE_TMP"
trap 'rm -rf "$RESTORE_TMP"' EXIT

echo "Extracting backup..."
tar -xf "$BACKUP_TAR" -C "$RESTORE_TMP"

EXTRACTED_PROJECT="$RESTORE_TMP/viras"
if [[ ! -d "$EXTRACTED_PROJECT" ]]; then
  echo "ERROR: Expected top-level folder 'viras' not found inside $BACKUP_NAME" >&2
  exit 1
fi

DUMP_FILE="$(find "$EXTRACTED_PROJECT" -maxdepth 1 -type f -name "*.dump" | sort | tail -n 1)"
if [[ "$SKIP_DB" != "true" && -z "$DUMP_FILE" ]]; then
  echo "ERROR: No database dump found inside backup tar." >&2
  exit 1
fi

prepare_target "$TARGET_DIR"

echo "Copying restored project files..."
cp -a "$EXTRACTED_PROJECT/." "$TARGET_DIR/"

if [[ "$SKIP_DB" != "true" ]]; then
  restore_database "$TARGET_DIR" "$DUMP_FILE"
else
  echo "Skipping database restore."
fi

if [[ "$SKIP_INSTALL" != "true" ]]; then
  echo "Installing backend dependencies..."
  npm --prefix "$TARGET_DIR/backend" ci

  echo "Generating Prisma Client..."
  npm --prefix "$TARGET_DIR/backend" run prisma:generate

  echo "Installing frontend dependencies..."
  npm --prefix "$TARGET_DIR/frontend" ci
else
  echo "Skipping npm install."
fi

if [[ "$SKIP_TESTS" != "true" ]]; then
  echo "Verifying backend..."
  npm --prefix "$TARGET_DIR/backend" run build
  npm --prefix "$TARGET_DIR/backend" test -- --runInBand

  echo "Verifying frontend..."
  npm --prefix "$TARGET_DIR/frontend" run build
  npm --prefix "$TARGET_DIR/frontend" test -- --watch=false
else
  echo "Skipping build/test verification."
fi

echo "Restore completed successfully."
echo "Restored project: $TARGET_DIR"
echo "Backup used: $BACKUP_NAME"
echo
echo "Start commands:"
echo "  cd \"$TARGET_DIR/backend\" && npm run start:dev"
echo "  cd \"$TARGET_DIR/frontend\" && npm run start -- --host 0.0.0.0"
