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

      <!-- Table View -->
      <div
        v-else
        class="overflow-hidden border border-gray-200 rounded-lg"
      >
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
              >
                Hora
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
              >
                Duración
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
              >
                Proyecto
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
              >
                Tipo
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
              >
                Actividad
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(event, index) in currentDayEvents"
              :key="index"
              class="transition-colors cursor-pointer hover:bg-gray-50"
              @click="handleEventClick(event)"
            >
              <td
                class="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap"
              >
                {{ formatTimeRange(event) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                {{ formatDuration(event.duration) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    getProjectColor(event.projectName),
                  ]"
                >
                  {{ event.projectName || 'Sin proyecto' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                <div class="flex items-center gap-1.5">
                  <component
                    :is="getActivityConfig(event.type).icon"
                    class="w-4 h-4 text-gray-400"
                  />
                  <span>{{ event.type }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                <div class="font-medium text-gray-900">
                  {{ event.title }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ActivityDetailModal
      :is-open="isModalOpen"
      :event="selectedEvent"
      @close="isModalOpen = false"
    />
  </div>
</template>
