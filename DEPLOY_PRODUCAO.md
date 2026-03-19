# Deploy Produção (Servidor Real + Render)

## 1) Servidor Real (Docker) - comando único

### Pré-requisitos
- Docker e Docker Compose instalados
- Porta `80` liberada no firewall

### Passos
1. Copie e ajuste variáveis:
   ```bash
   cp deploy/.env.prod.example deploy/.env.prod
   ```
   Gere `APP_KEY` com:
   ```bash
   docker run --rm -it php:8.2-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
   ```
2. Suba tudo com um único comando:
   ```bash
   ./deploy/subir_prod.sh
   ```
3. Valide:
   - `http://SEU_IP_OU_DOMINIO/up`
   - `http://SEU_IP_OU_DOMINIO/api/bootstrap`

### Comandos úteis
- Parar sem apagar dados:
  ```bash
  ./deploy/parar_prod.sh
  ```
- Parar e apagar banco/cache (destrutivo):
  ```bash
  ./deploy/parar_prod.sh --apagar-dados
  ```

### Observações
- Não use `down -v` em produção, salvo reset intencional.
- O script de produção executa apenas `migrate --force` (não roda `seed` automático).
- Para HTTPS em servidor próprio, coloque um proxy reverso com TLS (Nginx/Caddy/Traefik) na frente da API.

## 2) Render (Blueprint)

Arquivo: `render.yaml`

### Como subir
1. No Render, clique em **New + Blueprint**.
2. Selecione este repositório.
3. Preencha variáveis `sync: false`:
   - Backend: `APP_URL`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `FRONTEND_URL`
   - Frontend: `VITE_API_BASE_URL` = URL do backend + `/api`
4. Faça o deploy.

### Serviços criados
- `lavasys-backend` (web)
- `lavasys-queue` (worker)
- `lavasys-redis`
- `lavasys-frontend` (static site)

## 3) Checklist Go-live
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_KEY` definido
- [ ] CORS com `FRONTEND_URL` correto
- [ ] Banco com backup e restore testados
- [ ] Healthcheck `/up` funcionando
- [ ] Queue worker online
- [ ] Logs/alertas configurados
