<script setup lang="ts">
import {
  IconX,
  IconCalendar,
  IconClock,
  IconBriefcase,
} from '@tabler/icons-vue';
import dayjs from 'dayjs';
import { RouterLink } from 'vue-router';
import type { ActivityEvent } from '../../types/activity';

defineProps<{
  isOpen: boolean;
  event: ActivityEvent | null;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div
    v-if="isOpen && event"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto transition-opacity bg-black/50 backdrop-blur-sm"
  >
    <div
      class="relative w-full max-w-md bg-white shadow-2xl rounded-xl dark:bg-gray-800"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700"
      >
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          Detalles de la Actividad
        </h3>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 rounded-lg cursor-pointer hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
        >
          <IconX class="w-6 h-6" />
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ event.type }}
          </h4>
        </div>

        <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <div class="flex items-center">
            <IconCalendar class="w-5 h-5 mr-2 text-gray-400" />
            <span>{{ dayjs(event.date).format('DD-MM-YYYY HH:mm') }}</span>
          </div>

          <div v-if="event.duration" class="flex items-center">
            <IconClock class="w-5 h-5 mr-2 text-gray-400" />
            <span>{{ event.duration }}</span>
          </div>

          <div v-if="event.projectName" class="flex items-center">
            <IconBriefcase class="w-5 h-5 mr-2 text-gray-400" />
            <span class="mr-1">Proyecto:</span>
            <RouterLink
              v-if="event.projectId"
              :to="`/projects/${event.projectId}`"
              class="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {{ event.projectName }}
            </RouterLink>
            <span v-else>{{ event.projectName }}</span>
          </div>
        </div>

        <div
          v-if="event.description"
          class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
        >
          <p class="text-sm text-gray-600 dark:text-gray-300">
            {{ event.description }}
          </p>
        </div>
      </div>

      <div class="p-6 border-t border-gray-100 dark:border-gray-700">
        <button
          @click="$emit('close')"
          class="w-full rounded-lg bg-gray-100 px-5 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
