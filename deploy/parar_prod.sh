#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$BASE_DIR/.env.prod"
COMPOSE_FILE="$BASE_DIR/docker-compose.prod.yml"
MODE="${1:-}"

if [ "$MODE" = "--apagar-dados" ]; then
  echo "ATENCAO: removendo containers e volumes (dados serao apagados)."
  docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down -v
else
  docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down
fi

echo "Concluido."
