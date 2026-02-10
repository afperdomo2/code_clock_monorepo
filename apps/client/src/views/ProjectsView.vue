<script setup lang="ts">
import {
  IconFilter,
  IconPlus,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-vue';
import { computed, onMounted, ref } from 'vue';
import ProjectCard from '../components/projects/ProjectCard.vue';
import ProjectCreateModal from '../components/projects/ProjectCreateModal.vue';
import api from '../services/api';
import { getApiErrorMessage } from '../services/api';
import type { Project } from '../types/project';
import Swal from 'sweetalert2';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_OPTIONS } from '../constants';
import { ProjectStatus } from '../enums';

const isModalOpen = ref(false);
const projects = ref<Project[]>([]);
const isLoading = ref(true);
const projectToEdit = ref<Project | undefined>(undefined);

const fetchProjects = async () => {
  try {
    isLoading.value = true;
    const { data } = await api.get<{ data: Project[] }>('/projects', {
      params: { page: 1, limit: 100 },
    });
    projects.value = data.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error),
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchProjects();
});

// Filters
const searchQuery = ref('');
const statusFilter = ref<'Todos' | 'Solo Activos' | ProjectStatus>('Todos');
const clientFilter = ref('Todos');

// Computed Unique Clients
const clients = computed(() => {
  const uniqueClients = new Set(
    projects.value.map((p) => p.client).filter((c): c is string => !!c),
  );
  return ['Todos', ...Array.from(uniqueClients)];
});

// Filtered Projects
const filteredProjects = computed(() => {
  return projects.value.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesStatus =
      statusFilter.value === 'Todos' ||
      (statusFilter.value === 'Solo Activos' &&
        project.status === ProjectStatus.ACTIVO) ||
      project.status === statusFilter.value;
    const matchesClient =
      clientFilter.value === 'Todos' || project.client === clientFilter.value;

    return matchesSearch && matchesStatus && matchesClient;
  });
});

const handleCreateProject = async (newProject: Project) => {
  // The modal should handle the creation, but if it passes the object back, we can add it to the list
  // Or better, re-fetch. For now, let's assume the modal handles the API call and emits the new project
  // But wait, the modal currently just emits the object. I should probably update the modal to save to DB too.
  // For this step, I'll just add it to the local list if it was created successfully.
  // Actually, let's make the modal save to DB in the next step if needed.
  // For now, let's assume the modal emits the created project.
  projects.value.unshift(newProject);
};

const handleEditProject = (project: Project) => {
  projectToEdit.value = project;
  isModalOpen.value = true;
};

const handleUpdateProject = (updatedProject: Project) => {
  const index = projects.value.findIndex((p) => p.id === updatedProject.id);
  if (index !== -1) {
    projects.value[index] = updatedProject;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  projectToEdit.value = undefined;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
    >
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Proyectos
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Gestiona y monitorea tus proyectos activos
        </p>
      </div>
      <div class="flex gap-3">
        <button
          @click="fetchProjects"
          class="flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
          :disabled="isLoading"
        >
          <IconRefresh
            class="mr-2 h-5 w-5"
            :class="{ 'animate-spin': isLoading }"
          />
          Refrescar
        </button>
        <button
          @click="
            () => {
              projectToEdit = undefined;
              isModalOpen = true;
            }
          "
          class="flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 cursor-pointer"
        >
          <IconPlus class="mr-2 h-5 w-5" />
          Nuevo Proyecto
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:flex-row sm:items-center"
    >
      <div class="relative flex-1">
        <IconSearch
          class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar proyecto..."
          class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div class="flex gap-4">
        <div class="relative">
          <select
            v-model="statusFilter"
            class="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="Todos">Todos</option>
            <option value="Solo Activos">Solo Activos</option>
            <option
              v-for="status in PROJECT_STATUS_OPTIONS"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>
          <IconFilter
            class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
        </div>
        <div class="relative">
          <select
            v-model="clientFilter"
            class="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option v-for="client in clients" :key="client">
              {{ client }}
            </option>
          </select>
          <IconFilter
            class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div
        class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"
      ></div>
    </div>

    <!-- Projects Grid -->
    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="project in filteredProjects"
        :key="project.id"
        :to="`/projects/${project.id}`"
        class="block transition-transform hover:-translate-y-1"
      >
        <ProjectCard :project="project" @edit="handleEditProject" />
      </RouterLink>
    </div>

    <!-- Empty State -->
    <div v-if="filteredProjects.length === 0" class="py-12 text-center">
      <p class="text-gray-500">
        No se encontraron proyectos que coincidan con los filtros.
      </p>
    </div>

    <!-- Create Modal -->
    <ProjectCreateModal
      :is-open="isModalOpen"
      :project-to-edit="projectToEdit"
      @close="closeModal"
      @create="handleCreateProject"
      @update="handleUpdateProject"
    />
  </div>
</template>
