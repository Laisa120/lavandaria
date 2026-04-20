# Deploy Fly.io

Arquitetura preparada no Fly.io:
- MySQL: `genomni-mysql`
- API + worker: `genomni-api`
- Cliente: `genomni-app`
- Área técnica: `genomni-admin`
- Redis: Upstash Redis via Fly

## 1. Por que esta arquitetura

O Fly.io encaixa muito bem para:
- backend Laravel
- worker da fila
- sites estáticos em containers
- Redis gerenciado via Upstash

O caminho mais seguro em produção continua sendo MySQL gerenciado externo.
Mesmo assim, este projeto agora também está preparado para subir um MySQL direto no Fly para simplificar o arranque.

## 2. Instalar e autenticar

```bash
fly auth login
```

## 3. Criar MySQL no Fly

```bash
fly launch --no-deploy --copy-config --config deploy/fly/fly.mysql.toml
fly volumes create genomni_mysql_data --size 10 --region mad -a genomni-mysql
fly deploy --config deploy/fly/fly.mysql.toml
```

Host interno da API:

```bash
genomni-mysql.internal
```

## 4. Criar Redis no Fly

```bash
fly redis create
```

Guarda:
- `REDIS_HOST`
- `REDIS_PASSWORD` se o plano devolver senha
- porta

## 5. Criar a API

Na raiz do projeto:

```bash
fly launch --no-deploy --copy-config --config deploy/fly/fly.api.toml
```

Depois define os segredos:

```bash
fly secrets set \
  APP_KEY="..." \
  APP_URL="https://genomni-api.fly.dev" \
  DB_CONNECTION="mysql" \
  DB_HOST="genomni-mysql.internal" \
  DB_PORT="3306" \
  DB_DATABASE="lavasys" \
  DB_USERNAME="user" \
  DB_PASSWORD="password" \
  REDIS_HOST="..." \
  FRONTEND_URL="https://genomni-app.fly.dev" \
  APP_FRONTEND_URL="https://genomni-app.fly.dev" \
  ADMIN_FRONTEND_URL="https://genomni-admin.fly.dev" \
  FRONTEND_URLS="https://genomni-app.fly.dev,https://genomni-admin.fly.dev" \
  -a genomni-api
```

Publica:

```bash
fly deploy --config deploy/fly/fly.api.toml
```

Garante 1 máquina web e 1 worker:

```bash
fly scale count app=1 worker=1 -a genomni-api
```

## 6. Criar cliente

```bash
fly launch --no-deploy --copy-config --config deploy/fly/fly.app.toml
fly deploy --config deploy/fly/fly.app.toml
```

## 7. Criar área técnica

```bash
fly launch --no-deploy --copy-config --config deploy/fly/fly.admin.toml
fly deploy --config deploy/fly/fly.admin.toml
```

## 8. Validar

```bash
curl https://genomni-api.fly.dev/up
curl https://genomni-api.fly.dev/api/bootstrap
```

Abrir:
- `https://genomni-app.fly.dev`
- `https://genomni-admin.fly.dev`

## 9. Domínios próprios

Depois adiciona:

```bash
fly certs add api.seudominio.com -a genomni-api
fly certs add app.seudominio.com -a genomni-app
fly certs add admin.seudominio.com -a genomni-admin
```

## 10. Notas importantes

- `fly redis create` é o caminho oficial do Fly para Redis via Upstash.
- `release_command` da API já roda `php artisan migrate --force`.
- Os frontends usam a mesma base, mas com contexto forçado por build:
  - cliente: `VITE_FORCE_CONTEXT=app`
  - admin: `VITE_FORCE_CONTEXT=admin`
- O MySQL no Fly foi preparado para simplificar o deploy, mas em produção maior o ideal é migrar depois para um MySQL gerenciado.
