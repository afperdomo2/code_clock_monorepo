<script setup lang="ts">
import { IconPlayerPlay, IconRefresh } from '@tabler/icons-vue';
import { ref } from 'vue';
import DashboardCalendar from '../components/dashboard/DashboardCalendar.vue';
import TimeEntryModal from '../components/time/TimeEntryModal.vue';
import type { TimeEntry } from '../types/time';

const isTimeModalOpen = ref(false);
const dashboardCalendarRef = ref<InstanceType<typeof DashboardCalendar> | null>(
  null,
);
const isRefreshing = ref(false);

const handleSaveTimeEntry = (entry: TimeEntry) => {
  console.log('Time Entry Saved:', entry);
  // Refresh calendar manually to ensure immediate update
  refreshCalendar();
};

const refreshCalendar = async () => {
  if (dashboardCalendarRef.value) {
    isRefreshing.value = true;
    await dashboardCalendarRef.value.fetchActivities();
    setTimeout(() => {
      isRefreshing.value = false;
    }, 500); // Small delay for visual feedback
  }
};
</script>

<template>
  <div class="space-y-8">
    <!-- Calendar Section -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Calendario de Entregas
        </h2>
        <div class="flex space-x-2">
          <button
            @click="refreshCalendar"
            class="flex items-center justify-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="isRefreshing"
          >
            <IconRefresh
              :class="['w-5 h-5 mr-2', isRefreshing ? 'animate-spin' : '']"
            />
            Refrescar
          </button>
          <button
            @click="isTimeModalOpen = true"
            class="flex items-center justify-center px-4 py-2 text-white bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700"
          >
            <IconPlayerPlay class="w-5 h-5 mr-2" />
            Registrar Actividad
          </button>
        </div>
      </div>
      <DashboardCalendar ref="dashboardCalendarRef" />
    </section>

    <!-- Time Entry Modal -->
    <TimeEntryModal
      :is-open="isTimeModalOpen"
      @close="isTimeModalOpen = false"
      @save="handleSaveTimeEntry"
    />
  </div>
</template>
