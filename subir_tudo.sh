#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="/home/laisa/Área de trabalho/ambiente_de_producao"
DOCKER_DIR="$BASE_DIR/docker"
FRONTEND_DIR="$BASE_DIR/lavasys---sistema-de-faturação-de-lavandaria (2)"
RESET_DB="${1:-}"

echo "[1/5] Subindo containers..."
cd "$DOCKER_DIR"
docker-compose up -d --build

echo "[2/6] Garantindo variáveis mínimas no .env..."
cd "$BASE_DIR/backend"
grep -q '^APP_KEY=' .env || echo 'APP_KEY=' >> .env
grep -q '^CACHE_STORE=' .env || echo 'CACHE_STORE=redis' >> .env
grep -q '^SESSION_DRIVER=' .env || echo 'SESSION_DRIVER=redis' >> .env
grep -q '^REDIS_CLIENT=' .env || echo 'REDIS_CLIENT=phpredis' >> .env
grep -q '^REDIS_PORT=' .env || echo 'REDIS_PORT=6379' >> .env

echo "[3/6] Instalando dependências do Laravel..."
cd "$DOCKER_DIR"
docker-compose exec app composer install --no-interaction

echo "[4/6] Configurando Laravel (key + migrate)..."
docker-compose exec app php artisan key:generate --force

if [ "$RESET_DB" = "--reset-db" ]; then
  echo "      Modo RESET: apagando e recriando banco..."
  docker-compose exec app php artisan migrate:fresh --seed --force
else
  echo "      Modo normal: preservando dados existentes..."
  docker-compose exec app php artisan migrate --force
fi

docker-compose exec app php artisan config:clear

echo "[5/6] Instalando dependências do frontend..."
cd "$FRONTEND_DIR"
npm install

echo "[6/6] Iniciando frontend em modo desenvolvimento..."
echo "Frontend: http://localhost:3000"
echo "API:      http://localhost:8000/api/bootstrap"
echo "Login:    admin@lavasys.com / admin123"

npm run dev
