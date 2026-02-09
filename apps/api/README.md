# API - CodeClock (NestJS)

Documentacion base para el backend en apps/api. Los endpoints estan disponibles en Swagger.

## 🧭 Vista rapida

- 🧱 NestJS + TypeScript
- 🗃️ Prisma + PostgreSQL
- 🔐 JWT + Passport
- 🚦 Rate limiting con Throttler
- 📚 Swagger: /api/docs

## 🧰 Requisitos

- ✅ Node.js 22+
- ✅ pnpm
- ✅ PostgreSQL (puerto 5432)

## 🔧 Configuracion

Variables en .env:

- DATABASE_URL
- JWT_SECRET

Ejemplo en .env.example.

## ▶️ Ejecutar

```sh
pnpm nx serve api
```

Swagger:

- <http://localhost:3000/api/docs>

## 🔐 Auth y Seguridad

### 🔑 JWT

- Authorization: Bearer <token>
- Validacion con JwtStrategy + Passport

### 🛡️ Guards

- JwtAuthGuard protege rutas que no tengan @Public
- @Public expone rutas sin autenticacion

Ubicacion:

- apps/api/src/app/auth/guards/jwt-auth.guard.ts
- apps/api/src/app/auth/decorators/public.decorator.ts

### 🚦 Rate Limiting (Throttler)

- Configuracion global en AppModule
- Limites por defecto:
  - short: 10 req / 60s
  - medium: 100 req / 10 min
- Login y cambio de password usan limite estricto (5 / 60s)

Ubicacion:

- apps/api/src/app/app.module.ts
- apps/api/src/app/auth/auth.controller.ts

## 📦 Paginacion

Todos los endpoints findAll soportan:

- page (default 1)
- limit (default 20, max 100)

Respuesta:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "total_pages": 1
  }
}
```

DTOs:

- apps/api/src/app/common/dto/pagination-query.dto.ts
- apps/api/src/app/common/dto/pagination-meta.dto.ts

## 🧼 Buenas practicas aplicadas

- ✅ ValidationPipe global (whitelist + transform)
- ✅ DTOs + class-transformer para respuestas seguras
- ✅ Rate limiting en endpoints sensibles

## 📚 Endpoints

Consulta Swagger para el detalle completo:

- <http://localhost:3000/api/docs>
