# syntax=docker/dockerfile:1.7
# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app

# Copiar archivos de dependencias primero (mejor cache de capas)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
	pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Generar Prisma Client y construir la API
RUN pnpm prisma generate --schema=apps/api/prisma/schema.prisma
RUN pnpm nx build api

# ── Stage 2: Production ────────────────────────────────────────
FROM node:22-alpine

RUN apk add --no-cache dumb-init curl
WORKDIR /app

# Crear usuario no-root para runtime
RUN addgroup -S nodejs && adduser -S api -G nodejs

# Copiar build output (incluye package.json generado por webpack)
COPY --from=builder --chown=api:nodejs /app/dist/apps/api .

# Copiar schema + migraciones de Prisma
COPY --from=builder --chown=api:nodejs /app/apps/api/prisma ./prisma

# Instalar dependencias de producción y CLI de Prisma en una sola capa
RUN npm install --omit=dev prisma dotenv && npm cache clean --force

# Generar Prisma Client en contexto de producción
RUN ./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma

ENV NODE_ENV=production
EXPOSE 3000

USER api

# Ejecutar migraciones y luego iniciar la aplicación
CMD ["dumb-init", "sh", "-c", "./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma && node main.js"]
