<script setup lang="ts">
import { IconFilter, IconPlus, IconRefresh, IconSearch } from '@tabler/icons-vue';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import ProjectCard from '../components/projects/ProjectCard.vue';
import ProjectCreateModal from '../components/projects/ProjectCreateModal.vue';
import SectionLayout from '../components/layouts/SectionLayout.vue';
import { queryKeys } from '../composables/queryKeys';
import { useAlertOnError } from '../composables/useAlertOnError';
import { useProjectsQuery } from '../composables/useProjects';
import { PROJECT_STATUS_OPTIONS } from '../constants';
import { ProjectStatus } from '../enums';
import type { Project } from '../types/project';

const isModalOpen = ref(false);
const projectToEdit = ref<Project | undefined>(undefined);
const queryClient = useQueryClient();
const { data: projectsData, isLoading, isFetching, error, refetch } = useProjectsQuery();
useAlertOnError(error);

const projects = computed(() => projectsData.value ?? []);

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
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus =
      statusFilter.value === 'Todos' ||
      (statusFilter.value === 'Solo Activos' && project.status === ProjectStatus.ACTIVO) ||
      project.status === statusFilter.value;
    const matchesClient = clientFilter.value === 'Todos' || project.client === clientFilter.value;

    return matchesSearch && matchesStatus && matchesClient;
  });
});

const handleCreateProject = async (newProject: Project) => {
  queryClient.setQueryData<Project[]>(queryKeys.projects, (old) => {
    if (!old) return [newProject];
    return [newProject, ...old];
  });
};

const handleEditProject = (project: Project) => {
  projectToEdit.value = project;
  isModalOpen.value = true;
};

const handleUpdateProject = (updatedProject: Project) => {
  queryClient.setQueryData<Project[]>(queryKeys.projects, (old) => {
    if (!old) return [updatedProject];
    return old.map((project) => (project.id === updatedProject.id ? updatedProject : project));
  });
};

const closeModal = () => {
  isModalOpen.value = false;
  projectToEdit.value = undefined;
};
</script>

<template>
  <div class="space-y-6">
    <SectionLayout>
      <template #title>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Proyectos</h2>
      </template>

      <template #actions>
        <div class="flex-1 min-w-35">
          <button
            :disabled="isFetching"
            class="flex items-center justify-center w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="
              () => {
                void refetch();
              }
            "
          >
            <IconRefresh
              class="w-5 h-5 mr-2"
              :class="{ 'animate-spin': isFetching }"
            />
            Refrescar
          </button>
        </div>
        <div class="flex-1 min-w-50">
          <button
            class="flex items-center justify-center w-full px-4 py-2 text-white bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700"
            @click="
              () => {
                projectToEdit = undefined;
                isModalOpen = true;
              }
            "
          >
            <IconPlus class="w-5 h-5 mr-2" />
            Nuevo Proyecto
          </button>
        </div>
      </template>

      <template #content>
        <!-- Filters -->
        <div
          class="flex flex-col gap-4 p-4 mb-4 bg-white rounded-lg shadow sm:flex-row sm:items-center"
        >
          <div class="relative flex-1">
            <IconSearch class="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar proyecto..."
              class="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div class="flex gap-4">
            <div class="relative">
              <select
                v-model="statusFilter"
                class="py-2 pl-4 pr-10 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                class="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2"
              />
            </div>
            <div class="relative">
              <select
                v-model="clientFilter"
                class="py-2 pl-4 pr-10 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option
                  v-for="client in clients"
                  :key="client"
                >
                  {{ client }}
                </option>
              </select>
              <IconFilter
                class="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2"
              />
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div
          v-if="isLoading"
          class="flex justify-center py-12"
        >
          <div
            class="w-8 h-8 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"
          />
        </div>

        <!-- Projects Grid -->
        <div
          v-else
          class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <RouterLink
            v-for="project in filteredProjects"
            :key="project.id"
            :to="`/projects/${project.id}`"
            class="block transition-transform hover:-translate-y-1"
          >
            <ProjectCard
              :project="project"
              @edit="handleEditProject"
            />
          </RouterLink>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredProjects.length === 0"
          class="py-12 text-center"
        >
          <p class="text-gray-500">No se encontraron proyectos que coincidan con los filtros.</p>
        </div>
      </template>
    </SectionLayout>

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
