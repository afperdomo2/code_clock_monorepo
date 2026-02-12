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
  IconSettings,
  IconUsers,
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
      class="fixed inset-0 z-20 transition-opacity bg-black/50 lg:hidden"
      @click="toggleSidebar"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo / Header -->
        <div class="flex items-center justify-center h-16 px-6 border-b">
          <img
            src="/app_logo.png"
            alt="Code Clock Logo"
            class="w-8 h-8 mr-3"
          />
          <h1 class="text-2xl font-bold text-indigo-600">Code Clock</h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1">
          <RouterLink
            to="/"
            class="flex items-center px-4 py-3 text-gray-600 transition-colors rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
            active-class="text-indigo-600 bg-indigo-50"
          >
            <IconHome class="w-5 h-5 mr-3" />
            <span class="font-medium">Inicio</span>
          </RouterLink>
          <RouterLink
            to="/projects"
            class="flex items-center px-4 py-3 text-gray-600 transition-colors rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
            active-class="text-indigo-600 bg-indigo-50"
          >
            <IconBriefcase class="w-5 h-5 mr-3" />
            <span class="font-medium">Proyectos</span>
          </RouterLink>
          <RouterLink
            to="/analytics"
            class="flex items-center px-4 py-3 text-gray-600 transition-colors rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
            active-class="text-indigo-600 bg-indigo-50"
          >
            <IconChartBar class="w-5 h-5 mr-3" />
            <span class="font-medium">Analíticas</span>
          </RouterLink>
          <RouterLink
            v-if="authStore.isAdminUser"
            to="/users"
            class="flex items-center px-4 py-3 text-gray-600 transition-colors rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
            active-class="text-indigo-600 bg-indigo-50"
          >
            <IconUsers class="w-5 h-5 mr-3" />
            <span class="font-medium">Usuarios</span>
          </RouterLink>
        </nav>

        <!-- User Profile & Logout -->
        <div class="p-4 border-t">
          <div class="flex items-center px-4 mb-4">
            <div
              class="flex items-center justify-center w-10 h-10 text-indigo-600 bg-indigo-100 rounded-full"
            >
              <IconUser class="w-6 h-6" />
            </div>
            <div class="ml-3 overflow-hidden">
              <p class="text-sm font-medium text-gray-900 truncate">Usuario</p>
              <p class="text-xs text-gray-500 truncate">
                {{ authStore.userEmail }}
              </p>
            </div>
          </div>
          <div class="space-y-2">
            <RouterLink
              to="/profile"
              class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <IconSettings class="w-4 h-4 mr-2" />
              Perfil
            </RouterLink>
            <button
              class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-700 border border-transparent rounded-lg cursor-pointer bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              @click="handleLogout"
            >
              <IconLogout class="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Mobile Header -->
      <header class="flex items-center justify-between h-16 px-6 bg-white shadow-sm lg:hidden">
        <span class="text-xl font-bold text-indigo-600">Code Clock</span>
        <button
          class="p-2 text-gray-600 rounded-md cursor-pointer hover:bg-gray-100 focus:outline-none"
          @click="toggleSidebar"
        >
          <IconMenu2
            v-if="!isSidebarOpen"
            class="w-6 h-6"
          />
          <IconX
            v-else
            class="w-6 h-6"
          />
        </button>
      </header>

      <!-- Page Content -->
      <main
        class="flex-1 px-2.5 py-4 overflow-x-hidden overflow-y-auto bg-gray-100 sm:px-6 sm:py-6"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
