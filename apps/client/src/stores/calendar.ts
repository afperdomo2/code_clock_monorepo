import dayjs from 'dayjs';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type CalendarViewMode = 'day' | 'week' | 'month';

export const useCalendarStore = defineStore('calendar', () => {
  const viewMode = ref<CalendarViewMode>('month');
  const currentDate = ref(dayjs());

  const setViewMode = (mode: CalendarViewMode) => {
    viewMode.value = mode;
  };

  const setCurrentDate = (date: dayjs.Dayjs) => {
    currentDate.value = date;
  };

  const next = () => {
    currentDate.value = currentDate.value.add(1, viewMode.value);
  };

  const prev = () => {
    currentDate.value = currentDate.value.subtract(1, viewMode.value);
  };

  const today = () => {
    currentDate.value = dayjs();
  };

  return {
    viewMode,
    currentDate,
    setViewMode,
    setCurrentDate,
    next,
    prev,
    today,
  };
});
