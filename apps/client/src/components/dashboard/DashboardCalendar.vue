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
import { computed } from 'vue';
import { useAlertOnError } from '../../composables/useAlertOnError';
import { useCalendarActivitiesQuery } from '../../composables/useCalendarActivities';
import { useCalendarStore } from '../../stores/calendar';
import CalendarDayView from './calendar/CalendarDayView.vue';
import CalendarMonthView from './calendar/CalendarMonthView.vue';
import CalendarWeekView from './calendar/CalendarWeekView.vue';

dayjs.locale('es');

const store = useCalendarStore();
const monthKey = computed(() => store.currentDate.format('YYYY-MM'));
const { data: activitiesData, error, refetch, isFetching } = useCalendarActivitiesQuery(monthKey);
useAlertOnError(error);

const activities = computed(() => activitiesData.value ?? []);

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

defineExpose({
  fetchActivities: () => {
    if (!isFetching.value) {
      void refetch();
    }
  },
});
</script>

<template>
  <div class="px-3 py-4 bg-white rounded-lg shadow sm:px-4 sm:py-5 lg:px-6 lg:py-6">
    <div class="flex flex-col gap-4 mb-5 lg:mb-6">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 class="text-base font-bold text-gray-900 capitalize sm:text-lg lg:text-xl">
          {{ currentPeriodName }}
        </h3>
        <div class="inline-flex items-center self-start p-1 bg-gray-100 rounded-lg">
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

      <div class="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-lg w-full sm:w-auto sm:inline-grid">
        <button
          :class="[
            'flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md transition-all',
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
            'flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md transition-all',
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
            'flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md transition-all',
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

    <div class="min-h-130">
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
