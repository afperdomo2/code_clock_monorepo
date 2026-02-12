<script setup lang="ts">
import { IconCalendarOff } from '@tabler/icons-vue';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { getActivityConfig } from '../../../constants/activity';
import { useCalendarStore } from '../../../stores/calendar';
import type { ActivityEvent } from '../../../types/activity';
import { getProjectColor } from '../../../utils/colors';
import ActivityDetailModal from '../ActivityDetailModal.vue';

const props = defineProps<{
  activities: ActivityEvent[];
}>();

const store = useCalendarStore();

const currentDayEvents = computed(() => {
  return props.activities
    .filter(
      (e) =>
        dayjs(e.date).format('YYYY-MM-DD') ===
        store.currentDate.format('YYYY-MM-DD'),
    )
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
});

const selectedEvent = ref<ActivityEvent | null>(null);
const isModalOpen = ref(false);

const handleEventClick = (event: ActivityEvent) => {
  selectedEvent.value = event;
  isModalOpen.value = true;
};

const formatTimeRange = (event: ActivityEvent) => {
  const start = dayjs(event.date);
  if (!event.duration) return start.format('HH:mm');

  const durationHours = parseFloat(event.duration.replace(/[^0-9.]/g, ''));
  if (isNaN(durationHours)) return start.format('HH:mm');

  const end = start.add(durationHours, 'hour');
  return `${start.format('HH:mm')} - ${end.format('HH:mm')}`;
};

const formatDuration = (durationStr?: string) => {
  if (!durationStr) return '-';

  const totalHours = parseFloat(durationStr.replace(/[^0-9.]/g, ''));
  if (isNaN(totalHours)) return durationStr;

  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}:${minutes} h.`;
  } else if (hours > 0) {
    return `${hours}:00 h`;
  } else {
    return `${minutes} min.`;
  }
};
</script>

<template>
  <div
    class="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-center p-6 border-b border-gray-200 bg-gray-50"
    >
      <div class="text-center">
        <div class="text-sm font-medium text-gray-500 uppercase">
          {{ store.currentDate.format('dddd') }}
        </div>
        <div class="text-2xl font-bold text-gray-900">
          {{ store.currentDate.format('D MMMM YYYY') }}
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-6">
      <!-- Empty State -->
      <div
        v-if="currentDayEvents.length === 0"
        class="flex flex-col items-center justify-center h-64 text-gray-400"
      >
        <IconCalendarOff class="w-16 h-16 mb-4 opacity-50" />
        <p class="text-lg font-medium">
          No hay actividades registradas
        </p>
        <p class="text-sm">
          Disfruta tu día libre o registra una nueva actividad.
        </p>
      </div>

      <!-- Agenda View -->
      <div v-else class="max-w-4xl mx-auto space-y-3 sm:space-y-4">
        <button
          v-for="(event, index) in currentDayEvents"
          :key="index"
          class="w-full p-4 text-left transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md"
          @click="handleEventClick(event)"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="text-sm font-semibold text-gray-900 sm:text-base">
                {{ formatTimeRange(event) }}
              </div>
              <div class="text-xs text-gray-500 sm:text-sm">
                {{ formatDuration(event.duration) }}
              </div>
            </div>

            <span
              :class="[
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border self-start',
                getProjectColor(event.projectName),
              ]"
            >
              {{ event.projectName || 'Sin proyecto' }}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-2 mt-3 sm:grid-cols-[auto,1fr] sm:items-center sm:gap-3">
            <div class="inline-flex items-center gap-2 text-xs font-medium text-gray-600 sm:text-sm">
              <component
                :is="getActivityConfig(event.type).icon"
                class="w-4 h-4 text-gray-400"
              />
              <span>{{ event.type }}</span>
            </div>
            <div class="text-sm font-medium text-gray-900">
              {{ event.title }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <ActivityDetailModal
      :is-open="isModalOpen"
      :event="selectedEvent"
      @close="isModalOpen = false"
    />
  </div>
</template>
