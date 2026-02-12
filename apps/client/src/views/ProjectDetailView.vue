<script setup lang="ts">
import {
  IconArrowLeft,
  IconChartPie,
  IconCheck,
  IconChecklist,
  IconClock,
  IconEdit,
  IconPlayerPlay,
  IconTrash,
  IconX,
} from '@tabler/icons-vue';
import dayjs from 'dayjs';
import { PieChart } from 'echarts/charts';
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import Swal from 'sweetalert2';
import { computed, provide, ref } from 'vue';
import VChart, { THEME_KEY } from 'vue-echarts';
import { useRoute, useRouter } from 'vue-router';
import ActivityDetailModal from '../components/dashboard/ActivityDetailModal.vue';
import SectionLayout from '../components/layouts/SectionLayout.vue';
import ProjectCreateModal from '../components/projects/ProjectCreateModal.vue';
import TimeEntryModal from '../components/time/TimeEntryModal.vue';
import { useAlertOnError } from '../composables/useAlertOnError';
import {
  useCreateDeliverableMutation,
  useDeleteDeliverableMutation,
  useProjectDeliverablesQuery,
  useProjectQuery,
  useProjectTimeEntriesQuery,
  useUpdateDeliverableMutation,
} from '../composables/useProjectDetails';
import { useDeleteProjectMutation } from '../composables/useProjects';
import { PROJECT_STATUS_LABELS } from '../constants';
import { getApiErrorMessage } from '../services/api';
import type { ActivityEvent } from '../types/activity';
import type { Deliverable } from '../types/project';
import type { TimeEntry } from '../types/time';
import { formatHours } from '../utils/format';

// Register ECharts components
use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

provide(THEME_KEY, 'light');

const route = useRoute();
const router = useRouter();
const projectId = route.params.id as string;
const isTimeModalOpen = ref(false);
const isActivityModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedActivity = ref<ActivityEvent | null>(null);
const deleteProjectMutation = useDeleteProjectMutation();

const {
  data: projectData,
  isLoading,
  error: projectError,
  refetch: refetchProject,
} = useProjectQuery(projectId);
useAlertOnError(projectError);

const project = computed(() => projectData.value ?? null);

const handleDeleteProject = async () => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás revertir esta acción',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error), 'error');
      return;
    }

    await Swal.fire('Eliminado', 'El proyecto ha sido eliminado', 'success');
    router.push('/projects');
  }
};

const handleUpdateProject = async () => {
  await refetchProject();
  isEditModalOpen.value = false;
};

// Tabs State
const activeTab = ref<'summary' | 'deliverables'>('summary');

interface TimelineEvent extends TimeEntry {
  durationFormatted: string;
}

const {
  data: timeEntriesData,
  error: timeEntriesError,
  refetch: refetchTimeEntries,
} = useProjectTimeEntriesQuery(projectId);
const {
  data: deliverablesData,
  error: deliverablesError,
  refetch: refetchDeliverables,
} = useProjectDeliverablesQuery(projectId);
useAlertOnError(timeEntriesError);
useAlertOnError(deliverablesError);

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const timeline = computed<TimelineEvent[]>(() =>
  (timeEntriesData.value ?? []).map((t) => ({
    ...t,
    durationFormatted: formatDuration(t.duration),
  })),
);

const deliverables = computed<Deliverable[]>(() =>
  [...(deliverablesData.value ?? [])].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf();
  }),
);

const getColorForType = (type: string) => {
  const colors: Record<string, string> = {
    Desarrollo: '#6366f1',
    Reunión: '#f59e0b',
    Diseño: '#ec4899',
    Bugfix: '#ef4444',
    Planeación: '#10b981',
  };
  return colors[type] || '#9ca3af';
};

const chartData = computed(() => {
  const distribution: Record<string, number> = {};
  timeline.value.forEach((t) => {
    const type = t.activity_type || 'Other';
    const hours = t.duration / 3600;
    distribution[type] = (distribution[type] || 0) + hours;
  });

  return Object.entries(distribution).map(([name, value]) => ({
    value: parseFloat(value.toFixed(2)),
    name,
    itemStyle: { color: getColorForType(name) },
  }));
});

// Chart Option
const chartOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c}h ({d}%)' },
  legend: { bottom: '5%', left: 'center' },
  series: [
    {
      name: 'Distribución de Tiempo',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: chartData.value,
    },
  ],
}));

const handleSaveTimeEntry = async () => {
  // The modal handles saving to the API. We just refresh the data.
  await Promise.all([refetchTimeEntries(), refetchProject()]);
};

const newDeliverableTitle = ref('');
const isAddingDeliverable = ref(false);
const editingDeliverableId = ref<string | null>(null);
const editingDeliverableTitle = ref('');
const createDeliverableMutation = useCreateDeliverableMutation(projectId);
const updateDeliverableMutation = useUpdateDeliverableMutation(projectId);
const deleteDeliverableMutation = useDeleteDeliverableMutation(projectId);

const deliverableProgressPercentage = computed(() => {
  if (deliverables.value.length === 0) return 0;
  const completed = deliverables.value.filter((d) => d.completed).length;
  return Math.round((completed / deliverables.value.length) * 100);
});

const addDeliverable = async () => {
  if (!newDeliverableTitle.value.trim()) return;

  isAddingDeliverable.value = true;
  try {
    await createDeliverableMutation.mutateAsync({
      title: newDeliverableTitle.value,
      deadline: dayjs().add(1, 'week').toISOString(),
      completed: false,
    });

    newDeliverableTitle.value = '';
  } catch (error) {
    console.error('Error adding deliverable:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error),
    });
  } finally {
    isAddingDeliverable.value = false;
  }
};

const toggleDeliverable = async (item: Deliverable) => {
  try {
    await updateDeliverableMutation.mutateAsync({
      id: item.id,
      payload: { completed: !item.completed },
    });
  } catch (error) {
    console.error('Error toggling deliverable:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error),
    });
  }
};

const startEditDeliverable = (item: Deliverable) => {
  editingDeliverableId.value = item.id;
  editingDeliverableTitle.value = item.title;
};

const saveEditDeliverable = async (item: Deliverable) => {
  if (!editingDeliverableTitle.value.trim()) return;

  try {
    await updateDeliverableMutation.mutateAsync({
      id: item.id,
      payload: { title: editingDeliverableTitle.value },
    });

    editingDeliverableId.value = null;
    editingDeliverableTitle.value = '';
  } catch (error) {
    console.error('Error updating deliverable:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error),
    });
  }
};

const cancelEditDeliverable = () => {
  editingDeliverableId.value = null;
  editingDeliverableTitle.value = '';
};

const deleteDeliverable = async (item: Deliverable) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'El entregable será eliminado permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      await deleteDeliverableMutation.mutateAsync(item.id);
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error), 'error');
    }
  }
};

const openActivityModal = (event: TimelineEvent) => {
  selectedActivity.value = {
    id: event.id,
    date: event.date,
    title: event.activity_type,
    type: event.activity_type,
    projectId: projectId,
    projectName: project.value?.name,
    description: event.description,
    duration: event.durationFormatted,
  };
  isActivityModalOpen.value = true;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Back Button -->
    <button
      class="flex items-center text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
      @click="router.back()"
    >
      <IconArrowLeft class="w-4 h-4 mr-1" />
      Volver
    </button>

    <!-- Header -->
    <div v-if="project">
      <div class="max-w-5xl p-6 mx-auto bg-white rounded-lg shadow">
        <SectionLayout>
          <template #title>
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-2xl font-bold text-gray-900">
                  {{ project.name }}
                </h2>
                <span
                  class="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                >
                  {{ PROJECT_STATUS_LABELS[project.status] ?? project.status }}
                </span>
              </div>
              <p class="mt-1 text-gray-500">
                {{ project.client }}
              </p>
              <p
                v-if="project.description"
                class="max-w-2xl mt-4 text-gray-600"
              >
                {{ project.description }}
              </p>
            </div>
          </template>

          <template #actions>
            <div class="flex flex-wrap gap-2">
              <button
                class="flex items-center justify-center px-4 py-2 text-gray-700 transition-all bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                @click="isEditModalOpen = true"
              >
                <IconEdit class="w-5 h-5 mr-2" />
                Editar
              </button>
              <button
                class="flex items-center justify-center px-4 py-2 text-white transition-all bg-red-600 rounded-lg shadow-sm cursor-pointer hover:bg-red-700"
                @click="handleDeleteProject"
              >
                <IconTrash class="w-5 h-5 mr-2" />
                Eliminar
              </button>
              <button
                class="flex items-center justify-center px-4 py-2 text-white transition-all bg-indigo-600 rounded-lg shadow-lg cursor-pointer hover:bg-indigo-700 hover:shadow-xl"
                @click="isTimeModalOpen = true"
              >
                <IconPlayerPlay class="w-5 h-5 mr-2" />
                Registrar Actividad
              </button>
            </div>
          </template>

          <template #content>
            <div class="grid grid-cols-2 gap-4 pt-2 border-t sm:grid-cols-4">
              <div>
                <p class="text-sm text-gray-500">Horas Totales</p>
                <p class="text-xl font-semibold text-gray-900">
                  {{ formatHours(project.hours_spent) }}h
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Estimadas</p>
                <p class="text-xl font-semibold text-gray-900">
                  {{ project.hours_estimated ? formatHours(project.hours_estimated) : '-' }}h
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Fecha Entrega</p>
                <p class="text-xl font-semibold text-gray-900">
                  {{ project.deadline ? dayjs(project.deadline).format('DD-MM-YYYY') : '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Restante</p>
                <p class="text-xl font-semibold text-indigo-600">
                  {{
                    project.hours_estimated
                      ? `${formatHours(project.hours_estimated - project.hours_spent)}h`
                      : '-'
                  }}
                </p>
              </div>
            </div>
          </template>
        </SectionLayout>
      </div>
    </div>

    <div
      v-else-if="isLoading"
      class="flex items-center justify-center h-64"
    >
      <div
        class="w-12 h-12 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"
      />
    </div>

    <div
      v-else
      class="flex items-center justify-center h-64 text-gray-500"
    >
      Proyecto no encontrado
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Main Content (Tabs) -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow">
          <!-- Tabs Header -->
          <div class="border-b border-gray-200">
            <nav
              class="flex -mb-px"
              aria-label="Tabs"
            >
              <button
                :class="[
                  activeTab === 'summary'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'flex w-1/2 items-center justify-center border-b-2 py-4 px-1 text-center text-sm font-medium cursor-pointer',
                ]"
                @click="activeTab = 'summary'"
              >
                <IconClock class="w-5 h-5 mr-2" />
                Resumen & Tiempos
              </button>
              <button
                :class="[
                  activeTab === 'deliverables'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'flex w-1/2 items-center justify-center border-b-2 py-4 px-1 text-center text-sm font-medium cursor-pointer',
                ]"
                @click="activeTab = 'deliverables'"
              >
                <IconChecklist class="w-5 h-5 mr-2" />
                Entregables
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="px-6 pt-8 pb-12">
            <!-- Summary Tab -->
            <div
              v-if="activeTab === 'summary'"
              class="space-y-6"
            >
              <h3 class="text-lg font-medium text-gray-900">Historial de Sesiones</h3>
              <div class="flow-root">
                <ul
                  role="list"
                  class="-mb-8"
                >
                  <li
                    v-for="(event, eventIdx) in timeline"
                    :key="event.id"
                    class="p-2 -mx-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                    @click="openActivityModal(event)"
                  >
                    <div class="relative pt-1 pb-4">
                      <span
                        v-if="eventIdx !== timeline.length - 1"
                        class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                      <div class="relative flex space-x-3">
                        <div>
                          <span
                            class="flex items-center justify-center w-8 h-8 rounded-full ring-8 ring-white"
                            :style="{
                              backgroundColor: getColorForType(event.activity_type),
                            }"
                          >
                            <IconClock
                              class="w-5 h-5 text-white"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                        <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p class="text-sm text-gray-500">
                              {{ event.description }}
                            </p>
                          </div>
                          <div class="text-sm text-right text-gray-500 whitespace-nowrap">
                            <time :datetime="event.date">{{
                              dayjs(event.date).format('YYYY-MM-DD HH:mm')
                            }}</time>
                            <p class="font-medium text-gray-900">
                              {{ event.durationFormatted }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Deliverables Tab -->
            <div
              v-if="activeTab === 'deliverables'"
              class="space-y-6"
            >
              <!-- Progress Bar -->
              <div
                v-if="deliverables.length > 0"
                class="space-y-2"
              >
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-medium text-gray-900">Progreso de Entregables</h3>
                  <span class="text-sm font-medium text-gray-900">
                    {{ deliverables.filter((d) => d.completed).length }} de
                    {{ deliverables.length }}
                    completados
                  </span>
                </div>
                <div class="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    class="h-full transition-all duration-300"
                    :class="
                      deliverableProgressPercentage === 100 ? 'bg-green-500' : 'bg-indigo-600'
                    "
                    :style="{ width: `${deliverableProgressPercentage}%` }"
                  />
                </div>
                <p class="text-sm text-gray-600">{{ deliverableProgressPercentage }}% completado</p>
              </div>

              <!-- Add Deliverable -->
              <div class="flex gap-2">
                <input
                  v-model="newDeliverableTitle"
                  type="text"
                  placeholder="Nuevo entregable..."
                  class="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  @keyup.enter="addDeliverable"
                />
                <button
                  :disabled="isAddingDeliverable"
                  class="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm cursor-pointer hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="addDeliverable"
                >
                  <svg
                    v-if="isAddingDeliverable"
                    class="w-4 h-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Agregar</span>
                </button>
              </div>

              <!-- Deliverables List -->
              <div class="space-y-2">
                <div
                  v-for="item in deliverables"
                  :key="item.id"
                  class="flex items-center justify-between p-4 transition-colors border rounded-lg hover:bg-gray-50"
                >
                  <div class="flex items-center flex-1">
                    <input
                      type="checkbox"
                      :checked="item.completed"
                      class="w-4 h-4 text-indigo-600 border-gray-300 rounded cursor-pointer focus:ring-indigo-500"
                      @change="toggleDeliverable(item)"
                    />
                    <div
                      v-if="editingDeliverableId !== item.id"
                      class="flex-1 ml-3"
                    >
                      <span
                        :class="[
                          'text-sm font-medium',
                          item.completed ? 'text-gray-400 line-through' : 'text-gray-900',
                        ]"
                      >
                        {{ item.title }}
                      </span>
                      <p class="text-xs text-gray-500">
                        {{ dayjs(item.deadline).format('DD-MM-YYYY') }}
                      </p>
                    </div>
                    <div
                      v-else
                      class="flex-1 ml-3"
                    >
                      <input
                        v-model="editingDeliverableTitle"
                        type="text"
                        class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        @keyup.enter="saveEditDeliverable(item)"
                        @keyup.escape="cancelEditDeliverable"
                      />
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center gap-2 ml-4">
                    <template v-if="editingDeliverableId !== item.id">
                      <button
                        class="p-1 text-gray-500 rounded-md hover:text-indigo-600 hover:bg-gray-100"
                        title="Editar"
                        @click="startEditDeliverable(item)"
                      >
                        <IconEdit class="w-4 h-4" />
                      </button>
                      <button
                        class="p-1 text-gray-500 rounded-md hover:text-red-600 hover:bg-gray-100"
                        title="Eliminar"
                        @click="deleteDeliverable(item)"
                      >
                        <IconTrash class="w-4 h-4" />
                      </button>
                    </template>
                    <template v-else>
                      <button
                        class="p-1 text-green-600 rounded-md hover:text-green-700 hover:bg-gray-100"
                        title="Guardar"
                        @click="saveEditDeliverable(item)"
                      >
                        <IconCheck class="w-4 h-4" />
                      </button>
                      <button
                        class="p-1 text-red-600 rounded-md hover:text-red-700 hover:bg-gray-100"
                        title="Cancelar"
                        @click="cancelEditDeliverable"
                      >
                        <IconX class="w-4 h-4" />
                      </button>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div
                v-if="deliverables.length === 0"
                class="py-12 text-center text-gray-500"
              >
                <IconChecklist class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay entregables aún. ¡Agrega el primero!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar (Stats) -->
      <div class="space-y-6">
        <div class="p-6 bg-white rounded-lg shadow">
          <h3 class="flex items-center mb-4 text-lg font-medium text-gray-900">
            <IconChartPie class="w-5 h-5 mr-2 text-gray-500" />
            Distribución de Tiempo
          </h3>
          <div class="w-full h-64">
            <VChart
              :option="chartOption"
              autoresize
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Time Entry Modal -->
    <TimeEntryModal
      :is-open="isTimeModalOpen"
      :project-id="projectId"
      @close="isTimeModalOpen = false"
      @save="handleSaveTimeEntry"
    />

    <!-- Activity Detail Modal -->
    <ActivityDetailModal
      :is-open="isActivityModalOpen"
      :event="selectedActivity"
      @close="isActivityModalOpen = false"
    />

    <!-- Edit Project Modal -->
    <ProjectCreateModal
      v-if="project"
      :is-open="isEditModalOpen"
      :project-to-edit="project"
      @close="isEditModalOpen = false"
      @update="handleUpdateProject"
    />
  </div>
</template>
