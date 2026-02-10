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

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const calendarDays = computed(() => {
  const startOfMonth = store.currentDate.startOf('month');
  const startDayOfWeek = startOfMonth.day() === 0 ? 6 : startOfMonth.day() - 1;
  const daysInMonth = store.currentDate.daysInMonth();

  const days = [];

  // Previous month padding
  const prevMonth = store.currentDate.subtract(1, 'month');
  const daysInPrevMonth = prevMonth.daysInMonth();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonth.date(daysInPrevMonth - i),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = store.currentDate.date(i);
    days.push({
      date: date,
      isCurrentMonth: true,
      isToday: date.isSame(dayjs(), 'day'),
    });
  }

  // Next month padding
  const remainingCells = 42 - days.length;
  const nextMonth = store.currentDate.add(1, 'month');
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: nextMonth.date(i),
      isCurrentMonth: false,
      isToday: false,
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
  <div>
    <div
      class="grid grid-cols-7 gap-1 text-sm font-medium text-center text-gray-500"
    >
      <div v-for="day in weekDays" :key="day" class="py-2">{{ day }}</div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="[
          'relative flex min-h-[140px] flex-col items-start justify-start rounded-lg border p-2 transition-colors',
          day.isCurrentMonth
            ? 'bg-white text-gray-900'
            : 'bg-gray-50 text-gray-400',
          day.isToday ? 'ring-2 ring-indigo-600 ring-inset' : 'border-gray-100',
        ]"
      >
        <span
          :class="[
            'text-sm mb-1',
            day.isToday ? 'font-bold text-indigo-600' : '',
          ]"
        >
          {{ day.date.date() }}
        </span>

        <!-- Events -->
        <div class="w-full space-y-1">
          <button
            v-for="(event, eIdx) in getEventsForDay(day.date)"
            :key="eIdx"
            @click.stop="handleEventClick(event)"
            :class="[
              'block w-full text-left rounded px-1.5 py-1 text-xs cursor-pointer hover:opacity-80 border transition-shadow hover:shadow-sm',
              getProjectColor(event.projectName),
            ]"
            :title="`${event.projectName || 'Sin proyecto'} - ${event.title}`"
          >
            <div class="flex items-center gap-1 font-bold truncate">
              <component
                :is="getActivityConfig(event.type).icon"
                class="w-3 h-3"
              />
              {{ event.projectName || 'Sin proyecto' }}
            </div>
            <div
              class="flex justify-between items-center text-[10px] opacity-90 pl-4"
            >
              <span class="truncate max-w-[60%]">{{ event.type }}</span>
              <span>{{ event.duration?.replace(' horas', 'h') }}</span>
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
