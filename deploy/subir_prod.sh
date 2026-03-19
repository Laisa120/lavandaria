#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$BASE_DIR/.env.prod"
COMPOSE_FILE="$BASE_DIR/docker-compose.prod.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Arquivo $ENV_FILE nao encontrado."
  echo "Copie deploy/.env.prod.example para deploy/.env.prod e ajuste os valores."
  exit 1
fi

echo "[1/3] Subindo stack de producao..."
docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build

echo "[2/3] Aplicando migracoes..."
docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T app php artisan migrate --force

echo "[3/3] Limpando e recarregando cache de configuracao..."
docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T app php artisan optimize:clear
docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T app php artisan config:cache

echo "Concluido. API em: ${APP_URL:-http://localhost}"
