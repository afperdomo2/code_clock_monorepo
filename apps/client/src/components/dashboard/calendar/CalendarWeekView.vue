<script setup lang="ts">
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

const weekDays = computed(() => {
  const startOfWeek = store.currentDate.startOf('week');
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.add(i, 'day');
    days.push({
      date: date,
      name: date.format('dddd'),
      dayNum: date.format('D'),
      isToday: date.isSame(dayjs(), 'day'),
    });
  }
  return days;
});

const getEventsForDay = (date: dayjs.Dayjs) => {
  return props.activities.filter(
    (e) => dayjs(e.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'),
  );
};

const selectedEvent = ref<ActivityEvent | null>(null);
const isModalOpen = ref(false);

const handleEventClick = (event: ActivityEvent) => {
  selectedEvent.value = event;
  isModalOpen.value = true;
};
</script>

<template>
  <div
    class="flex flex-col h-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow"
  >
    <!-- Header Row -->
    <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
      <div
        v-for="day in weekDays"
        :key="day.date.toString()"
        :class="[
          'py-3 text-center border-r border-gray-200 last:border-r-0',
          day.isToday ? 'bg-indigo-50' : '',
        ]"
      >
        <div class="text-xs font-medium text-gray-500 uppercase">
          {{ day.name }}
        </div>
        <div
          :class="[
            'mt-1 text-lg font-semibold inline-flex items-center justify-center w-8 h-8 rounded-full',
            day.isToday ? 'bg-indigo-600 text-white' : 'text-gray-900',
          ]"
        >
          {{ day.dayNum }}
        </div>
      </div>
    </div>

    <!-- Body Row -->
    <div class="grid grid-cols-7 flex-1 min-h-[500px]">
      <div
        v-for="day in weekDays"
        :key="day.date.toString()"
        :class="[
          'p-2 border-r border-gray-200 last:border-r-0 overflow-y-auto',
          day.isToday ? 'bg-indigo-50/30' : '',
        ]"
      >
        <div class="space-y-2">
          <button
            v-for="(event, index) in getEventsForDay(day.date)"
            :key="index"
            @click="handleEventClick(event)"
            :class="[
              'block w-full text-left rounded-lg p-3 text-sm cursor-pointer hover:opacity-90 border transition-shadow hover:shadow-md',
              getProjectColor(event.projectName),
            ]"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="flex items-center gap-2 text-xs font-bold truncate">
                <component
                  :is="getActivityConfig(event.type).icon"
                  class="w-4 h-4"
                />
                {{ event.projectName || 'Sin proyecto' }}
              </span>
            </div>
            <div class="mb-1 text-xs font-medium line-clamp-2">
              {{ event.title }}
            </div>
            <div
              class="flex items-center justify-between text-[10px] opacity-75"
            >
              <span>{{ event.duration }}</span>
              <span class="capitalize">{{ event.type }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <ActivityDetailModal
      :is-open="isModalOpen"
      :event="selectedEvent"
      @close="isModalOpen = false"
    />
  </div>
</template>
