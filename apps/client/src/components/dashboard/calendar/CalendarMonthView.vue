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
const weekDaysMobile = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

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
    <div>
      <div
        class="grid grid-cols-7 gap-0.5 text-xs font-medium text-center text-gray-500 sm:gap-1 sm:text-sm"
      >
        <div
          v-for="(day, index) in weekDays"
          :key="day"
          class="py-2"
        >
          <span class="sm:hidden">{{ weekDaysMobile[index] }}</span>
          <span class="hidden sm:inline">{{ day }}</span>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-0.5 sm:gap-1">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="[
            'relative flex min-h-20 sm:min-h-30 lg:min-h-35 flex-col items-start justify-start rounded-md sm:rounded-lg border p-1 sm:p-2 transition-colors',
            day.isCurrentMonth
              ? 'bg-white text-gray-900'
              : 'bg-gray-50 text-gray-400',
            day.isToday ? 'ring-2 ring-indigo-600 ring-inset' : 'border-gray-100',
          ]"
        >
          <span
            :class="[
              'mb-1 text-[11px] sm:text-sm',
              day.isToday ? 'font-bold text-indigo-600' : '',
            ]"
          >
            {{ day.date.date() }}
          </span>

          <div class="flex flex-wrap w-full gap-1 sm:hidden">
            <button
              v-for="(event, eIdx) in getEventsForDay(day.date)"
              :key="`dot-${eIdx}`"
              :class="[
                'w-1.5 h-1.5 rounded-full border cursor-pointer',
                getProjectColor(event.projectName),
              ]"
              :title="`${event.projectName || 'Sin proyecto'} - ${event.title}`"
              @click.stop="handleEventClick(event)"
            />
          </div>

          <div class="hidden w-full space-y-1 sm:block">
            <button
              v-for="(event, eIdx) in getEventsForDay(day.date)"
              :key="eIdx"
              :class="[
                'block w-full text-left rounded px-1 py-0.5 sm:px-1.5 sm:py-1 text-[10px] sm:text-xs cursor-pointer hover:opacity-80 border transition-shadow hover:shadow-sm',
                getProjectColor(event.projectName),
              ]"
              :title="`${event.projectName || 'Sin proyecto'} - ${event.title}`"
              @click.stop="handleEventClick(event)"
            >
              <div class="flex items-center gap-1 font-bold truncate">
                <component
                  :is="getActivityConfig(event.type).icon"
                  class="w-3 h-3"
                />
                {{ event.projectName || 'Sin proyecto' }}
              </div>
              <div
                class="flex items-center justify-between opacity-90 text-[10px]"
              >
                <span class="truncate max-w-[60%]">{{ event.type }}</span>
                <span>{{ event.duration?.replace(' horas', 'h') }}</span>
              </div>
            </button>
          </div>
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
