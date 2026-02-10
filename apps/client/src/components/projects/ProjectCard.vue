<script setup lang="ts">
import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconUser,
} from '@tabler/icons-vue';
import dayjs from 'dayjs';
import { computed } from 'vue';
import type { Project } from '../../types/project';
import { formatHours } from '../../utils/format';
import {
  PROJECT_CATEGORY_LABELS,
  PROJECT_PRIORITY_LABELS,
  PROJECT_STATUS_LABELS,
} from '../../constants';
import { ProjectCategory, ProjectPriority, ProjectStatus } from '../../enums';

const props = defineProps<{
  project: Project;
}>();

// Cálculos visuales
const progressPercentage = computed(() => {
  if (!props.project.hours_estimated || props.project.hours_estimated === 0)
    return 0;
  return Math.min(
    (props.project.hours_spent / props.project.hours_estimated) * 100,
    100,
  );
});

const progressColor = computed(() => {
  const p = progressPercentage.value;
  if (p > 90) return 'bg-red-500';
  if (p > 75) return 'bg-yellow-500';
  return 'bg-green-500';
});

const priorityLevel = computed(() => {
  switch (props.project.priority) {
    case ProjectPriority.ALTA:
      return 3;
    case ProjectPriority.MEDIA:
      return 2;
    case ProjectPriority.BAJA:
      return 1;
    default:
      return 0;
  }
});

const priorityColorClass = computed(() => {
  switch (props.project.priority) {
    case ProjectPriority.ALTA:
      return 'bg-red-500';
    case ProjectPriority.MEDIA:
      return 'bg-orange-500';
    case ProjectPriority.BAJA:
      return 'bg-blue-500';
    default:
      return 'bg-gray-300';
  }
});

const statusConfig = computed(() => {
  switch (props.project.status) {
    case ProjectStatus.ACTIVO:
      return {
        classes:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
    case ProjectStatus.PAUSA:
      return {
        classes:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case ProjectStatus.FINALIZADO:
      return {
        classes:
          'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
    default:
      return { classes: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };
  }
});

const cardBackgroundClass = computed(() => {
  switch (props.project.status) {
    case ProjectStatus.PAUSA:
      return 'bg-amber-50/50 dark:bg-amber-900/10';
    case ProjectStatus.FINALIZADO:
      return 'bg-rose-50/50 dark:bg-rose-900/10';
    default:
      return 'bg-white dark:bg-gray-800';
  }
});

const isDeadlineClose = computed(() => {
  if (!props.project.deadline) return false;
  const daysLeft = dayjs(props.project.deadline).diff(dayjs(), 'day');
  return daysLeft <= 3 && daysLeft >= 0;
});

const categoryIcon = computed(() => {
  switch (props.project.category) {
    case ProjectCategory.EMPRESA:
      return IconBuildingSkyscraper;
    case ProjectCategory.PERSONAL:
      return IconUser;
    case ProjectCategory.FREELANCE:
      return IconBriefcase;
    default:
      return IconBriefcase;
  }
});
</script>

<template>
  <div
    class="relative flex flex-col justify-between h-full p-5 transition-all border border-gray-200 shadow-sm group rounded-xl hover:shadow-md dark:border-gray-700"
    :class="cardBackgroundClass"
  >
    <!-- Header: Status y Prioridad -->
    <div class="flex items-start justify-between mb-4">
      <!-- Status Badge -->
      <span
        class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
        :class="statusConfig.classes"
      >
        <span
          class="mr-1.5 h-2 w-2 rounded-full"
          :class="statusConfig.dot"
        />
        {{ PROJECT_STATUS_LABELS[project.status] ?? project.status }}
      </span>

      <div class="flex items-center gap-3">
        <!-- Graphical Priority -->
        <div
          class="flex items-end gap-1"
          :title="`Prioridad: ${PROJECT_PRIORITY_LABELS[project.priority] ?? project.priority}`"
        >
          <div
            class="w-1 h-3 transition-colors rounded-full"
            :class="
              priorityLevel >= 1
                ? priorityColorClass
                : 'bg-gray-200 dark:bg-gray-600'
            "
          />
          <div
            class="w-1 h-4 transition-colors rounded-full"
            :class="
              priorityLevel >= 2
                ? priorityColorClass
                : 'bg-gray-200 dark:bg-gray-600'
            "
          />
          <div
            class="w-1 h-5 transition-colors rounded-full"
            :class="
              priorityLevel >= 3
                ? priorityColorClass
                : 'bg-gray-200 dark:bg-gray-600'
            "
          />
        </div>
      </div>
    </div>

    <!-- Título y Cliente -->
    <div class="mb-4">
      <h3
        class="text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 line-clamp-1"
        :title="project.name"
      >
        {{ project.name }}
      </h3>
    </div>

    <!-- Métricas y Progreso -->
    <div class="mt-auto space-y-4">
      <!-- Barra de Progreso -->
      <div v-if="project.hours_estimated">
        <div class="flex justify-between mb-1 text-xs">
          <span class="text-gray-500 dark:text-gray-400">Progreso</span>
          <span class="font-medium text-gray-700 dark:text-gray-300">
            {{ formatHours(project.hours_spent) }} /
            {{ formatHours(project.hours_estimated) }} h
          </span>
        </div>
        <div
          class="w-full h-2 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-700"
        >
          <div
            class="h-full transition-all duration-500 ease-out"
            :class="progressColor"
            :style="{ width: `${progressPercentage}%` }"
          />
        </div>
      </div>
      <div v-else>
        <div class="flex justify-between mb-1 text-xs">
          <span class="text-gray-500 dark:text-gray-400">Horas invertidas</span>
          <span class="font-medium text-gray-700 dark:text-gray-300">
            {{ formatHours(project.hours_spent) }} h
          </span>
        </div>
      </div>

      <!-- Footer: Fecha y Badges -->
      <div
        class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700"
      >
        <div
          v-if="project.deadline"
          class="flex items-center text-xs font-medium"
          :class="
            isDeadlineClose
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-500 dark:text-gray-400'
          "
        >
          <IconCalendar class="mr-1.5 h-4 w-4" />
          {{ dayjs(project.deadline).format('DD MMM') }}
        </div>
        <div
          v-else
          class="flex items-center text-xs font-medium text-gray-400"
        >
          <IconCalendar class="mr-1.5 h-4 w-4" />
          <span>Sin fecha</span>
        </div>

        <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span
            class="flex items-center px-2 py-1 mr-0 bg-gray-100 rounded dark:bg-gray-700"
          >
            <component
              :is="categoryIcon"
              class="w-3 h-3 mr-1"
            />
            {{
              project.category === ProjectCategory.EMPRESA
                ? project.client
                : (PROJECT_CATEGORY_LABELS[project.category] ??
                  project.category)
            }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
