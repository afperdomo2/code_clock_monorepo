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
└── client/           # Frontend (puerto 5173)
libs/
└── prisma-client/    # Acceso a DB con Prisma
```

## 🛠️ Stack

- **Backend**: NestJS
- **Frontend**: Vue 3 + Vite
- **DB**: PostgreSQL
- **ORM**: Prisma v7
- **Lenguaje**: TypeScript
- **Monorepo**: Nx

## 🚀 Inicio rapido

### Requisitos

- Node.js 22+
- pnpm
- PostgreSQL (Puerto 5432)

### Setup

```sh
pnpm install

# Variables de entorno (usar .env.example como base)
# Crear .env en la raiz del proyecto

# Migraciones
pnpm prisma migrate dev --config=libs/prisma-client/prisma.config.ts

# Generar cliente (despues de cambios en el schema)
pnpm prisma generate --config=libs/prisma-client/prisma.config.ts
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
pnpm prisma studio --config=libs/prisma-client/prisma.config.ts
pnpm prisma migrate dev --config=libs/prisma-client/prisma.config.ts
pnpm prisma generate --config=libs/prisma-client/prisma.config.ts

# Nx graph
pnpm nx graph
```

## 🧩 Prisma (config separada)

- Schema: `libs/prisma-client/prisma/schema.prisma`
- Config: `libs/prisma-client/prisma.config.ts`
- Env: `.env` en la raiz

## ❗ Troubleshooting

- Prisma requiere `--config` para cargar `prisma.config.ts`:

```sh
# Correcto
pnpm prisma migrate dev --config=libs/prisma-client/prisma.config.ts

# Incorrecto
pnpm prisma migrate dev --schema=libs/prisma-client/prisma/schema.prisma
```

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
