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
```

## 🛠️ Tecnologías Principales

- **Framework**: [NestJS](https://nestjs.com) (Backend)
- **Frontend**: [Vue 3](https://vuejs.org) con [Vite](https://vitejs.dev)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org)
- **Monorepo**: [Nx](https://nx.dev)
- **Testing**: [Jest](https://jestjs.io)
- **Linting**: [ESLint](https://eslint.org) + [Prettier](https://prettier.io)

## 🚀 Guía de Inicio Rápido

### Requisitos Previos

- Node.js 18+
- npm o pnpm

### Instalación

```sh
# Instalar dependencias
npm install
```

### Ejecutar la Aplicación

```sh
# Ejecutar el API
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

``` Organización del Código

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
- [Vite - Frontend Tooling](https://vitejs.dev)

## 🤝 Contribuir

Para contribuir al proyecto:

1. Crea una rama para tu feature
2. Realiza tus cambios
3. Ejecuta `npx nx format` para asegurar el formato correcto
4. Ejecuta `npx nx lint` para verificar linting
5. Crea un pull request

## ❓ Soporte

Para reportar issues o solicitar features, por favor abre un issue en el repositorio.
