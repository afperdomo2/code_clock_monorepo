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

# Variable de entorno para la URL de la API (baked at build time por Vite)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Construir el cliente
RUN pnpm nx build client

# ── Stage 2: Nginx ─────────────────────────────────────────────
FROM nginx:alpine

# Copiar archivos estáticos generados por Vite
COPY --from=builder /app/dist/apps/client /usr/share/nginx/html

# Copiar configuración de nginx (SPA + reverse proxy a la API)
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
