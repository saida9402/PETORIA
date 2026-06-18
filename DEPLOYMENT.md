# Petoria Frontend — VPS Deployment Guide

Next.js 14 · Node 20 · Docker · standalone output

---

## Prerequisites

| Tool | Version |
|------|---------|
| Docker | 24+ |
| Docker Compose | v2 (plugin, `docker compose`) |
| Git | any |

No Node.js or Yarn required on the server — the build happens inside Docker.

---

## How the image works

`next build` is run with `output: 'standalone'` in `next.config.js`.  
Next.js traces every file the server actually imports and writes a self-contained
server to `.next/standalone/server.js` (~200 MB).  Full `node_modules` are NOT
copied to the runtime image.

The three-stage Dockerfile does:

1. **deps** — `yarn install --frozen-lockfile` (all deps, cached layer)
2. **builder** — `yarn build` (bakes `NEXT_PUBLIC_*` env vars into the bundle)
3. **runner** — copies only `standalone/`, `.next/static/`, and `public/`

---

## First deployment

### 1. Clone the repository

```bash
git clone https://github.com/your-org/petoriashop-next.git
cd petoriashop-next
```

### 2. Create the production environment file

```bash
cp .env.production.example .env.production
```

Open `.env.production` and fill in every required value:

```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_API_GRAPHQL_URL=https://api.your-domain.com/graphql
NEXT_PUBLIC_API_WS=wss://api.your-domain.com
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
ANTHROPIC_API_KEY=sk-ant-...      # optional — only if AI chat is active
```

> **Important:** `NEXT_PUBLIC_*` values are inlined into the JavaScript bundle
> at build time. The Docker image must be **rebuilt** whenever these change.

### 3. Build and start

```bash
docker compose -f docker-compose.production.yml --env-file .env.production up -d --build
```

The container starts on port **4000**. Verify:

```bash
docker compose -f docker-compose.production.yml ps
curl -I http://localhost:4000
```

---

## Updating after a code change

```bash
git pull

docker compose -f docker-compose.production.yml --env-file .env.production \
  up -d --build --force-recreate
```

Old containers are replaced with zero-downtime swap (single replica).

---

## Nginx reverse proxy (TLS)

Edit `nginx/nginx.conf` — replace `YOUR_DOMAIN` with your domain:

```bash
sed -i 's/YOUR_DOMAIN/petoria.example.com/g' nginx/nginx.conf
```

### Option A — Host-level Nginx

```bash
sudo cp nginx/nginx.conf /etc/nginx/sites-available/petoria-frontend
sudo ln -sf /etc/nginx/sites-available/petoria-frontend \
            /etc/nginx/sites-enabled/petoria-frontend
sudo nginx -t && sudo systemctl reload nginx
```

Issue a certificate:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Option B — Nginx inside Docker

Uncomment the `nginx` service block in `docker-compose.production.yml` and mount
the certificates:

```yaml
volumes:
  - ./nginx/nginx.conf:/etc/nginx/conf.d/petoria.conf:ro
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

Change the `frontend` service's ports from `"4000:4000"` to just the internal
network binding (remove host port) so Nginx is the only entry point.

---

## Environment variable reference

| Variable | Category | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | build-time | ✅ | NestJS backend base URL |
| `NEXT_PUBLIC_API_GRAPHQL_URL` | build-time | ✅ | GraphQL endpoint |
| `NEXT_PUBLIC_API_WS` | build-time | ✅ | WebSocket endpoint — must be `wss://` |
| `NEXT_PUBLIC_OPENWEATHER_API_KEY` | build-time | ❌ | Weather bar API key |
| `NEXT_PUBLIC_WEATHER_FALLBACK_LAT` | build-time | ❌ | Fallback weather latitude |
| `NEXT_PUBLIC_WEATHER_FALLBACK_LNG` | build-time | ❌ | Fallback weather longitude |
| `NEXT_PUBLIC_WEATHER_FALLBACK_CITY` | build-time | ❌ | Fallback weather city name |
| `ANTHROPIC_API_KEY` | runtime | ❌ | AI chat — server-side only |
| `PORT` | runtime | ❌ | Container port (default: 4000) |

---

## Logs and monitoring

```bash
# Follow live logs
docker compose -f docker-compose.production.yml logs -f frontend

# Last 100 lines
docker compose -f docker-compose.production.yml logs --tail=100 frontend
```

---

## Troubleshooting

### Container exits immediately

```bash
docker compose -f docker-compose.production.yml logs frontend
```

Common causes:
- Missing required `NEXT_PUBLIC_*` env var — the build will have substituted an
  empty string and API calls will fail at startup
- Port 4000 already in use on the host — change `"4000:4000"` to `"4001:4000"`

### WebSocket connection refused in production

Confirm `NEXT_PUBLIC_API_WS` uses `wss://` (not `ws://`).  
Browsers block mixed-content WebSocket connections on HTTPS pages.

### i18n translations not loading

The `public/locales/` directory must be present in the image. It is copied from
the builder stage in the Dockerfile. If translations are missing, confirm the
directory exists in the repository and is not listed in `.dockerignore`.

### Image optimization returns 400

Next.js built-in image optimization (`<Image />`) is enabled by default.  
If your backend serves images from a different domain, add it to
`images.domains` in `next.config.js`:

```js
images: {
  domains: ['api.your-domain.com'],
}
```

---

## File inventory

```
Dockerfile                      Multi-stage production image
.dockerignore                   Excludes node_modules, .env, .next from build context
docker-compose.production.yml   Compose file for VPS deployment
nginx/nginx.conf                Nginx reverse proxy with TLS and static caching
.env.production.example         Environment variable template
DEPLOYMENT.md                   This file
next.config.js                  output: 'standalone' added for Docker support
```
