<script setup lang="ts">
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutGrid,
  IconLayoutList,
} from '@tabler/icons-vue';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { computed, onMounted, ref } from 'vue';
import { useCalendarStore } from '../../stores/calendar';
import api, { getApiErrorMessage } from '../../services/api';
import type { ActivityEvent } from '../../types/activity';
import type { TimeEntry } from '../../types/time';
import CalendarDayView from './calendar/CalendarDayView.vue';
import CalendarMonthView from './calendar/CalendarMonthView.vue';
import CalendarWeekView from './calendar/CalendarWeekView.vue';
import Swal from 'sweetalert2';

dayjs.locale('es');

const store = useCalendarStore();
const activities = ref<ActivityEvent[]>([]);

// Use store date for display
const currentPeriodName = computed(() => {
  if (store.viewMode === 'day') {
    return store.currentDate.format('D [de] MMMM, YYYY');
  } else if (store.viewMode === 'week') {
    const start = store.currentDate.startOf('week');
    const end = store.currentDate.endOf('week');
    if (start.month() === end.month()) {
      return `${start.format('D')} - ${end.format('D [de] MMMM, YYYY')}`;
    }
    return `${start.format('D MMM')} - ${end.format('D MMM, YYYY')}`;
  }
  return store.currentDate.format('MMMM YYYY');
});

// Fetch activities from database
const fetchActivities = async () => {
  try {
    const [{ data: entriesData }, { data: projectsData }] = await Promise.all([
      api.get<{ data: TimeEntry[] }>('/time-entries', {
        params: { page: 1, limit: 100 },
      }),
      api.get<{ data: { id: string; name: string }[] }>('/projects', {
        params: { page: 1, limit: 100 },
      }),
    ]);

    const projectsMap = new Map(projectsData.data.map((p) => [p.id, p.name]));

    activities.value = entriesData.data.map((entry) => ({
      id: entry.id,
      date: entry.date,
      title: entry.description || 'Sin descripcion',
      type: entry.activity_type || 'work',
      projectId: entry.project_id,
      projectName: projectsMap.get(entry.project_id),
      description: entry.description,
      duration: `${(entry.duration / 3600).toFixed(1).replace(/\.0$/, '')} horas`,
    }));
  } catch (error) {
    console.error('Error fetching activities:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error),
    });
  }
};

onMounted(() => {
  fetchActivities();
});

defineExpose({
  fetchActivities,
});
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <div
      class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-4">
        <h3 class="text-lg font-bold text-gray-900 capitalize min-w-[200px]">
          {{ currentPeriodName }}
        </h3>
        <div class="flex items-center p-1 bg-gray-100 rounded-lg">
          <button
            class="p-1 text-gray-600 transition-all rounded-md hover:bg-white hover:shadow-sm"
            @click="store.prev()"
          >
            <IconChevronLeft class="w-5 h-5" />
          </button>
          <button
            class="px-3 py-1 text-xs font-medium text-gray-600 transition-all rounded-md hover:bg-white hover:shadow-sm"
            @click="store.today()"
          >
            Hoy
          </button>
          <button
            class="p-1 text-gray-600 transition-all rounded-md hover:bg-white hover:shadow-sm"
            @click="store.next()"
          >
            <IconChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="flex p-1 bg-gray-100 rounded-lg">
        <button
          :class="[
            'flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all',
            store.viewMode === 'day'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ]"
          @click="store.setViewMode('day')"
        >
          <IconLayoutList class="w-4 h-4 mr-1.5" />
          Día
        </button>
        <button
          :class="[
            'flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all',
            store.viewMode === 'week'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ]"
          @click="store.setViewMode('week')"
        >
          <IconLayoutGrid class="w-4 h-4 mr-1.5" />
          Semana
        </button>
        <button
          :class="[
            'flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all',
            store.viewMode === 'month'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ]"
          @click="store.setViewMode('month')"
        >
          <IconCalendar class="w-4 h-4 mr-1.5" />
          Mes
        </button>
      </div>
    </div>

    <div class="min-h-[600px]">
      <CalendarMonthView
        v-if="store.viewMode === 'month'"
        :activities="activities"
      />
      <CalendarWeekView
        v-else-if="store.viewMode === 'week'"
        :activities="activities"
      />
      <CalendarDayView
        v-else-if="store.viewMode === 'day'"
        :activities="activities"
      />
    </div>
  </div>
</template>

<style scoped>
/* Removed custom scrollbar styles as they are no longer needed in the main view */
</style>
