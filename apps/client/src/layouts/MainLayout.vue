<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  IconHome,
  IconLogout,
  IconMenu2,
  IconX,
  IconUser,
  IconBriefcase,
  IconChartBar,
} from '@tabler/icons-vue';

const authStore = useAuthStore();
const router = useRouter();
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleLogout = async () => {
  await authStore.signOut();
  router.push('/login');
};
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden"
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex h-full flex-col">
        <!-- Logo / Header -->
        <div class="flex h-16 items-center justify-center border-b px-6">
          <img src="/app_logo.png" alt="Code Clock Logo" class="mr-3 h-8 w-8" />
          <h1 class="text-2xl font-bold text-indigo-600">Code Clock</h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1 px-4 py-6">
          <RouterLink
            to="/"
            class="flex items-center rounded-lg px-4 py-3 text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            active-class="bg-indigo-50 text-indigo-600"
          >
            <IconHome class="mr-3 h-5 w-5" />
            <span class="font-medium">Inicio</span>
          </RouterLink>
          <RouterLink
            to="/projects"
            class="flex items-center rounded-lg px-4 py-3 text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            active-class="bg-indigo-50 text-indigo-600"
          >
            <IconBriefcase class="mr-3 h-5 w-5" />
            <span class="font-medium">Proyectos</span>
          </RouterLink>
          <RouterLink
            to="/analytics"
            class="flex items-center rounded-lg px-4 py-3 text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            active-class="bg-indigo-50 text-indigo-600"
          >
            <IconChartBar class="mr-3 h-5 w-5" />
            <span class="font-medium">Analíticas</span>
          </RouterLink>
        </nav>

        <!-- User Profile & Logout -->
        <div class="border-t p-4">
          <div class="mb-4 flex items-center px-4">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"
            >
              <IconUser class="h-6 w-6" />
            </div>
            <div class="ml-3 overflow-hidden">
              <p class="truncate text-sm font-medium text-gray-900">Usuario</p>
              <p class="truncate text-xs text-gray-500">
                {{ authStore.userEmail }}
              </p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="flex w-full items-center justify-center rounded-lg border border-transparent bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
          >
            <IconLogout class="mr-2 h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Mobile Header -->
      <header
        class="flex h-16 items-center justify-between bg-white px-6 shadow-sm lg:hidden"
      >
        <span class="text-xl font-bold text-indigo-600">Code Clock</span>
        <button
          @click="toggleSidebar"
          class="rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none cursor-pointer"
        >
          <IconMenu2 v-if="!isSidebarOpen" class="h-6 w-6" />
          <IconX v-else class="h-6 w-6" />
        </button>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 p-6">
        <slot></slot>
      </main>
    </div>
  </div>
</template>
