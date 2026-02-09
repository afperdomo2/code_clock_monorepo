# CodeClockMono

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

Un monorepo moderno construido con [Nx](https://nx.dev) que integra un backend robusto con [NestJS](https://nestjs.com) y un frontend dinámico con [Vue 3](https://vuejs.org).

## 📋 Descripción del Proyecto

CodeClockMono es un monorepo escalable que proporciona:

- **Backend API**: Servidor NestJS con arquitectura modular
- **Frontend Client**: Aplicación Vue 3 con Vite y TypeScript
- **Tests Unitarios**: Pruebas con Jest
- **Configuración compartida**: Linting, TypeScript y ESLint centralizados

### Estructura del Proyecto

```
apps/
├── api/              # Backend con NestJS (puerto 3000)
└── client/           # Frontend con Vue 3 + Vite
libs/
└── prisma-client/    # Librería compartida para acceso a DB con Prisma
```

### Configuración de Base de Datos

El proyecto utiliza Prisma ORM con configuración separada:

- **Schema**: `libs/prisma-client/prisma/schema.prisma`
- **Config**: `libs/prisma-client/prisma.config.ts`
- **Variables de entorno**: `.env` (en la raíz del proyecto)

## 🛠️ Tecnologías Principales

- **Framework**: [NestJS](https://nestjs.com) (Backend)
- **Frontend**: [Vue 3](https://vuejs.org) con [Vite](https://vitejs.dev)
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org)
- **ORM**: [Prisma](https://www.prisma.io) v7.x (con configuración separada)
- **Docs API**: [Swagger](https://swagger.io)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org)
- **Monorepo**: [Nx](https://nx.dev)
- **Testing**: [Jest](https://jestjs.io)
- **Linting**: [ESLint](https://eslint.org) + [Prettier](https://prettier.io)

## 🚀 Guía de Inicio Rápido

### Requisitos Previos

- Node.js 18+
- npm o pnpm
- PostgreSQL (Puerto 5432)

### Instalación y Configuración

```sh
# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env en la raíz basado en el ejemplo proporcionado

# Ejecutar migraciones de base de datos
npx prisma migrate dev --config=libs/prisma-client/prisma.config.ts

# Generar cliente de Prisma (después de cambios en el schema)
npx prisma generate --config=libs/prisma-client/prisma.config.ts
```

### Ejecutar la Aplicación

```sh
# Ejecutar el API.
La documentación Swagger está disponible en `http://localhost:3000/api/docs`.
npx nx serve api

# Ejecutar el cliente
npx nx serve client
```

El API estará disponible en `http://localhost:3000/api` y el cliente en `http://localhost:5173`

## 📦 Comandos Disponibles

### Ejecución General

Para ejecutar cualquier tarea con Nx:

```sh
npx nx <target> <project-name>
```

### Ejemplos de Tareas

```sh
# Construir un proyecto
npx nx build api
npx nx build client

# Ejecutar tests unitarios
npx nx test api
npx nx test client

# Linting y formateo
npx nx lint api
npx nx lint client
npx nx format

# Base de datos (Prisma)
npx prisma migrate dev --config=libs/prisma-client/prisma.config.ts  # Ejecutar migraciones
npx prisma generate --config=libs/prisma-client/prisma.config.ts     # Generar cliente
npx prisma studio --config=libs/prisma-client/prisma.config.ts       # Abrir Prisma Studio

# Ver el grafo de dependencias
npx nx graph
```

## 📊 Explorar el Espacio de Trabajo

Para visualizar la estructura del proyecto y las dependencias entre aplicaciones:

```sh
npx nx graph
```

Este comando abre una interfaz visual interactiva donde puedes explorar:

- Dependencias entre proyectos
- Tareas disponibles
- Configuración de cada proyecto

## ➕ Agregar Nuevos Proyectos

### Usando Generadores de Nx

```sh
# Agregar una nueva aplicación NestJS
npx nx g @nx/nest:app apps/my-api

# Agregar una nueva aplicación Vue
npx nx g @nx/vue:app apps/my-client

# Agregar una librería compartida
npx nx g @nx/nest:lib libs/shared
```

Primero lista los plugins disponibles:

```sh
npx nx list
```

Luego explora los generadores de un plugin específico:

```sh
npx nx list @nx/nest
```

## 🧪 Testing

### Tests Unitarios

```sh
# Ejecutar tests de un proyecto
npx nx test api

# Ejecutar tests en modo watch
npx nx test api -- --watch

# Ejecutar tests con cobertura
npx nx test api -- --coverage
```

### Tests E2E

```Organización del Código

- Cada aplicación tiene su propio `project.json` con configuración específica
- Las configuraciones compartidas están en `tsconfig.base.json` y `nx.json`
- Los tests se colocan junto al código fuente con extensión `.spec.ts`

### Convenciones de Nombrado

- Aplicaciones en `apps/`
- Librerías compartidas en `libs/`
- Archivos de configuración específicos del proyecto en la raíz del proyecto

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 📚 Recursos Adicionales

- [Documentación de Nx](https://nx.dev/docs)
- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de Vue 3](https://vuejs.org)
- [Prisma ORM](https://www.prisma.io/docs)

- [Vite - Frontend Tooling](https://vitejs.dev)

## ❓ Solución de Problemas

### Comandos de Prisma

Los comandos de Prisma deben ejecutarse con `--config` para especificar el archivo de configuración:

```sh
# ✅ Correcto
npx prisma migrate dev --config=libs/prisma-client/prisma.config.ts

# ❌ Incorrecto (no carga la configuración)
npx prisma migrate dev --schema=libs/prisma-client/prisma/schema.prisma
```

### Base de Datos

- Asegúrate de que PostgreSQL esté ejecutándose en el puerto 5432
- Verifica que las credenciales en `.env` sean correctas
- Si hay problemas de conexión, ejecuta: `npx prisma db push --config=libs/prisma-client/prisma.config.ts`

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crea una rama para tu feature
2. Realiza tus cambios
3. Ejecuta `npx nx format` para asegurar el formato correcto
4. Ejecuta `npx nx lint` para verificar linting
5. Crea un pull request

## ❓ Soporte

Para reportar issues o solicitar features, por favor abre un issue en el repositorio.

```
