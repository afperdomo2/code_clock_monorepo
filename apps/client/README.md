# ⚡ Client (Frontend) — Code Clock

Este es el frontend de **Code Clock**, una aplicación moderna para la gestión del tiempo y proyectos, construida con **Vue 3**, **Vite** y el poder de **Nx**.

---

## 🚀 Tecnologías Principales

- 🟢 **Vue 3 (Composition API)** - Framework core.
- ⚡ **Vite** - Bundler ultra rápido.
- 🍍 **Pinia** - Gestión de estado global.
- 🔍 **TanStack Query (Vue Query)** - Gestión de peticiones, caché y sincronización de datos.
- 🛣️ **Vue Router** - Enrutamiento SPA.
- 🎨 **Tailwind CSS** - Framework de estilos.
- 📡 **Axios** - Cliente HTTP con interceptores robustos.

---

## 🛠️ Instalación y Ejecución

### 📦 Requisitos

- [pnpm](https://pnpm.io/) instalado globalmente.

### 🏃 Pasos

1. **Instalar dependencias** (desde la raíz del monorepo):

   ```bash
   pnpm install
   ```

2. **Iniciar en desarrollo**:

   ```bash
   pnpm nx serve client
   ```

3. **Producción (Build)**:

   ```bash
   pnpm nx build client
   ```

---

## 📂 Estructura del Proyecto

- 🏗️ `src/main.ts`: Punto de entrada, configuración de plugins y proveedores.
- 🔌 `src/services/api.ts`: Configuración de **Axios**, interceptores de seguridad y lógica de refresh token.
- 🔐 `src/stores/auth.ts`: Gestión de la sesión, persistencia y perfil de usuario.
- 🎣 `src/composables/`: Hooks personalizados y lógica de negocio reactiva (TanStack Query).
- 🖼️ `src/views/` & `src/components/`: Vistas de página y componentes de UI reutilizables.
- 📜 `src/types/`: Definiciones de interfaces y tipos TypeScript globales.

---

## 📡 Gestión de Peticiones (TanStack Query)

Hemos configurado una estrategia de caché balanceada para optimizar el rendimiento y la experiencia de usuario:

### ⚙️ Configuración Global (`src/main.ts`)

- **`staleTime: 30,000` (30s)**: Los datos se mantienen "frescos" para evitar peticiones redundantes en acciones rápidas.
- **`gcTime: 5 mins`**: Los datos inactivos permanecen en memoria antes de ser eliminados.
- **`retry: 1`**: Reintento automático único para fallos de red momentáneos.
- **`refetchOnWindowFocus: false`**: Evita recargas innecesarias al cambiar de pestaña.

> 💡 **Tip:** Puedes sobrescribir estas opciones en cada `useQuery` específico si el recurso lo requiere.

---

## 🔐 Autenticación y Seguridad

### 🔄 Manejo de Tokens

La aplicación utiliza un sistema de **Access Token (memoria)** y **Refresh Token (Cookie HTTP-Only)**.

1. **Interceptores**: Cada petición añade automáticamente el Bearer token.
2. **Auto-Refresh**: Si recibimos un `401 Unauthorized`, el interceptor intenta renovar el token automáticamente sin interrumpir al usuario.
3. **Resiliencia al Throttling (429)**: Si el servidor limita las peticiones, el cliente **no cierra la sesión** inmediatamente, permitiendo al usuario reintentar tras unos segundos.

---

## 🚦 Throttling y Límites del API

El API cuenta con limitadores de tráfico para proteger el servicio.

- 🛑 **Error 429**: "Demasiadas solicitudes. Espera un momento e intenta de nuevo."
- 🧩 **Optimización**: Se recomienda no abusar del botón "Refrescar". Se ha implementado `staleTime` para mitigar esto.

---

## 💎 Buenas Prácticas

- ✅ **Invalidación de Cache**: Siempre usar `queryClient.invalidateQueries` tras una mutación exitosa.
- ✅ **Feedback Visual**: Usar los estados `isLoading` o `isFetching` para mostrar spinners al usuario.
- ✅ **Validación**: Los formularios utilizan **Vee-Validate** y **Yup** para una validación robusta en el cliente.

---

## 🧪 Calidad de Código

Mantén el proyecto limpio con:

```bash
# Ejecutar Linter
pnpm nx lint client --fix

# Formatear código
npx prettier --write apps/client
```

---

✨ _Desarrollado como parte del monorepo Code Clock._
