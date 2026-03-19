#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="/home/laisa/Área de trabalho/ambiente_de_producao"
DOCKER_DIR="$BASE_DIR/docker"

MODE="${1:-}" # --apagar-dados opcional

echo "[1/2] Parando frontend (se estiver rodando neste terminal, use Ctrl+C)."
echo "[2/2] Parando containers..."
cd "$DOCKER_DIR"

if [ "$MODE" = "--apagar-dados" ]; then
  echo "ATENCAO: removendo volumes do banco e cache (dados serao apagados)."
  docker-compose down -v
else
  docker-compose down
fi

echo "Concluido."
