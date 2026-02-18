# CodeClockMono

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

Monorepo moderno con backend NestJS y frontend Vue 3, orquestado con Nx.

## ✨ Highlights

- 🧩 Backend modular con NestJS
- ⚡ Frontend Vue 3 + Vite
- 🗃️ Prisma + PostgreSQL
- 🧰 Tooling unificado con Nx

## 🧱 Estructura

```
apps/
├── api/              # Backend (puerto 3000)
│   └── prisma/        # Acceso a DB con Prisma
└── client/           # Frontend (puerto 5173)
```

## 🛠️ Stack

- **Backend**: NestJS
- **Frontend**: Vue 3 + Vite
- **DB**: PostgreSQL
- **ORM**: Prisma v7
- **Lenguaje**: TypeScript
- **Monorepo**: Nx
- **Containerización**: Docker + Docker Compose
- **Despliegue**: Dokploy

## 🚀 Inicio rapido

### Requisitos

#### Desarrollo local (sin Docker)

- Node.js 22+
- pnpm
- PostgreSQL 16+ (Puerto 5432)

#### Con Docker

- Docker + Docker Compose
- (PostgreSQL, Node.js, pnpm se instalan en los contenedores)

### Setup

```sh
pnpm install

# Variables de entorno (usar .env.example como base)
# Crear .env en la raiz del proyecto

# Migraciones
pnpm prisma migrate dev --config=apps/api/prisma.config.ts

# Generar cliente (despues de cambios en el schema)
pnpm prisma generate --config=apps/api/prisma.config.ts
```

### Ejecutar

```sh
# API
pnpm nx serve api

# Cliente
pnpm nx serve client
```

- API: <http://localhost:3000/api>
- Swagger: <http://localhost:3000/api/docs>
- Cliente: <http://localhost:5173>

## 🐳 Deploy con Docker

### Docker Compose (Múltiples configuraciones)

El proyecto incluye varios archivos `docker-compose` para diferentes entornos:

- **`docker-compose.local.yml`**: Desarrollo local (BD, API, Client todo en contenedores, expone PostgreSQL en puerto 5434)
- **`docker-compose.dokploy.yml`**: Despliegue en Dokploy (BD interna, API y Client optimizados para producción)

### 🐳 Producción local

Levanta automáticamente la base de datos, API y Cliente en contenedores para desarrollo:

```sh
# Build de imágenes + Levantar servicios (una línea)
docker compose -f docker-compose.local.yml up -d --build

# O en dos pasos:

# 1. Build de imágenes
docker compose -f docker-compose.local.yml build

# 2. Levantar servicios
docker compose -f docker-compose.local.yml up -d
```

```sh
# Ver logs
docker compose -f docker-compose.local.yml logs -f api

# Detener
docker compose -f docker-compose.local.yml down

# Reset completo (borrar volúmenes/BD)
docker compose -f docker-compose.local.yml down -v
```

**Acceso (docker-compose.local.yml):**

- Cliente: <http://localhost>
- API: <http://localhost/api>
- Swagger: <http://localhost/api/docs>
- PostgreSQL: `localhost:5434` (usuario: `devuser`, contraseña: `devpassword123`)

### 🐳 Despliegue en Dokploy

Configurado para despliegue en [Dokploy](https://dokploy.com/), una plataforma de despliegue con base de datos interna y servicios optimizados para producción:

```sh
# Build de imágenes + Levantar servicios
docker compose -f docker-compose.dokploy.yml up -d --build

# Ver logs
docker compose -f docker-compose.dokploy.yml logs -f api

# Detener
docker compose -f docker-compose.dokploy.yml down

# Reset completo (borrar volúmenes/BD)
docker compose -f docker-compose.dokploy.yml down -v
```

### Configuración de Entorno

#### Variables requeridas

Copiar de [.env.example](.env.example) y configurar según el entorno:

**Para `docker-compose.local.yml`:**

```bash
# API
JWT_SECRET=your-jwt-secret-here

API_PORT=3000 # Opcional
CLIENT_PORT=4200 # Opcional
```

**Para `docker-compose.dokploy.yml`:**

```bash
# Base de datos (configurada internamente)
POSTGRES_USER=your-db-user
POSTGRES_PASSWORD=your-db-password
POSTGRES_DB=codeclock_prod

# API
JWT_SECRET=your-production-jwt-secret
```

## 🧪 Comandos utiles

```sh
# Build
pnpm nx build api
pnpm nx build client

# Tests
pnpm nx test api
pnpm nx test client

# Lint
pnpm nx lint api
pnpm nx lint client
pnpm nx format

# Prisma
pnpm prisma studio --config=apps/api/prisma.config.ts
pnpm prisma migrate dev --config=apps/api/prisma.config.ts
pnpm prisma generate --config=apps/api/prisma.config.ts

# Nx graph
pnpm nx graph
```

## 🧩 Prisma (config separada)

- Schema: `apps/api/prisma/schema.prisma`
- Config: `apps/api/prisma.config.ts`
- Env: `.env` en la raiz

## ❗ Troubleshooting

- Prisma requiere `--config` para cargar `prisma.config.ts`:

```sh
# Correcto
pnpm prisma migrate dev --config=apps/api/prisma.config.ts

# Incorrecto
pnpm prisma migrate dev --schema=apps/api/prisma/schema.prisma
```

- **Docker build falla**: Limpiar cache y reconstruir desde cero:

```sh
docker compose -f docker-compose.local.yml down -v
docker system prune -a
docker compose -f docker-compose.local.yml build --no-cache
docker compose -f docker-compose.local.yml up -d
```

- **API no accesible desde cliente**: Verificar que `VITE_API_URL=/api` en `.env` (usa reverse proxy de nginx)

- **Despliegue en Dokploy falla ("not found" en frontend)**:
  - Verificar que el cliente tenga `ports: - "80:80"` en `docker-compose.dokploy.yml`
  - Asegurar que el cliente no dependa de la API para iniciarse (remover `depends_on` si es necesario)
  - Revisar logs del contenedor cliente: `docker logs <container-name>`
  - Verificar que nginx esté sirviendo archivos desde `/usr/share/nginx/html`

- **API no saludable en Dokploy**:
  - Verificar que las migraciones Prisma se ejecuten correctamente en el entrypoint
  - Revisar logs de la API: `docker compose -f docker-compose.dokploy.yml logs api`
  - Asegurar que `DATABASE_URL` apunte correctamente al servicio `db`

## 🧠 Skills (Agentes)

Skills instaladas para asistir el desarrollo:

- NestJS Best Practices
  - Instalacion: `npx skills add https://github.com/kadajett/agent-nestjs-skills --skill nestjs-best-practices`
  - Archivo: [.agents/skills/nestjs-best-practices/SKILL.md](.agents/skills/nestjs-best-practices/SKILL.md)

## 🤖 IA y MCP

Servidores MCP configurados en [.vscode/mcp.json](.vscode/mcp.json):

- nx-mcp (command: `npx`, args: `nx-mcp@latest`)
- Prisma-Local (command: `npx`, args: `-y prisma mcp`)

## 📝 Licencia

MIT
