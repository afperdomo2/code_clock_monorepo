# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app

# Copiar archivos de dependencias primero (mejor cache de capas)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Generar Prisma Client y construir la API
RUN pnpm prisma generate --schema=apps/api/prisma/schema.prisma
RUN pnpm nx build api

# ── Stage 2: Production ────────────────────────────────────────
FROM node:22-alpine

RUN apk add --no-cache dumb-init curl
WORKDIR /app

# Copiar build output (incluye package.json generado por webpack)
COPY --from=builder /app/dist/apps/api .

# Copiar schema + migraciones de Prisma y su configuración
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/prisma.config.ts .

# Instalar dependencias de producción + prisma CLI para migraciones
RUN npm install --omit=dev && npm install prisma dotenv

# Generar Prisma Client en contexto de producción
RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 3000

# Ejecutar migraciones y luego iniciar la aplicación
CMD ["dumb-init", "sh", "-c", "npx prisma migrate deploy && node main.js"]
