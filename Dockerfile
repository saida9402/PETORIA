# ─────────────────────────────────────────────────────────────────────────────
# Petoria Frontend — Multi-stage Dockerfile
# Next.js 14 · Node 20 · standalone output
#
# NEXT_PUBLIC_* variables are inlined into the JS bundle at build time.
# The image must be rebuilt whenever any of these values change.
# Runtime-only secrets (ANTHROPIC_API_KEY) are injected via docker-compose
# environment or the host's env — they do NOT need to be a build arg.
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Install all dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps

# libc6-compat: required by some npm native bindings on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 120000


# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are baked into the static bundle during `next build`.
# Pass them as --build-arg at `docker build` time (see docker-compose.production.yml).
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_GRAPHQL_URL
ARG NEXT_PUBLIC_API_WS
ARG NEXT_PUBLIC_OPENWEATHER_API_KEY
ARG NEXT_PUBLIC_WEATHER_FALLBACK_LAT=37.5385
ARG NEXT_PUBLIC_WEATHER_FALLBACK_LNG=127.2153
ARG NEXT_PUBLIC_WEATHER_FALLBACK_CITY=Hanam-si

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_API_GRAPHQL_URL=$NEXT_PUBLIC_API_GRAPHQL_URL \
    NEXT_PUBLIC_API_WS=$NEXT_PUBLIC_API_WS \
    NEXT_PUBLIC_OPENWEATHER_API_KEY=$NEXT_PUBLIC_OPENWEATHER_API_KEY \
    NEXT_PUBLIC_WEATHER_FALLBACK_LAT=$NEXT_PUBLIC_WEATHER_FALLBACK_LAT \
    NEXT_PUBLIC_WEATHER_FALLBACK_LNG=$NEXT_PUBLIC_WEATHER_FALLBACK_LNG \
    NEXT_PUBLIC_WEATHER_FALLBACK_CITY=$NEXT_PUBLIC_WEATHER_FALLBACK_CITY \
    NODE_ENV=production

RUN yarn build


# ── Stage 3: Production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000 \
    HOSTNAME=0.0.0.0

# Non-root user — matches Next.js official Docker recommendations
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Standalone output: only the files traced by Next.js file-system tracer.
# ~200 MB vs ~1 GB for a full node_modules copy.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Static assets and compiled CSS (referenced by the standalone server)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Public directory: images, locales (required by next-i18next at runtime),
# robots.txt, sitemap.xml
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 4000

# standalone/server.js reads PORT and HOSTNAME from the environment
CMD ["node", "server.js"]
