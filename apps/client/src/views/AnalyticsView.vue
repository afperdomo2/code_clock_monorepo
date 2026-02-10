<script setup lang="ts">
import { IconRefresh } from '@tabler/icons-vue';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';
import HeatmapChart from '../components/dashboard/HeatmapChart.vue';
import TimeDistributionChart from '../components/dashboard/TimeDistributionChart.vue';
import api from '../services/api';
import { getApiErrorMessage } from '../services/api';
import Swal from 'sweetalert2';

const currentYear = dayjs().year();
const heatmapData = ref<[string, number][]>([]);
const distributionData = ref<
  { date: string; projectName: string; duration: number }[]
>([]);
const isLoading = ref(true);
const isRefreshing = ref(false);

const fetchData = async () => {
  try {
    isLoading.value = true;
    isRefreshing.value = true;
    const startOfYear = dayjs(`${currentYear}-01-01`).toISOString();
    const endOfYear = dayjs(`${currentYear}-12-31`).endOf('day').toISOString();

    const [{ data: entriesData }, { data: projectsData }] = await Promise.all([
      api.get<{
        data: { date: string; duration: number; project_id: string }[];
      }>('/time-entries', {
        params: { from: startOfYear, to: endOfYear, page: 1, limit: 100 },
      }),
      api.get<{ data: { id: string; name: string }[] }>('/projects', {
        params: { page: 1, limit: 100 },
      }),
    ]);

    const entries = entriesData.data;
    const projects = projectsData.data;

    if (entries && projects) {
      const projectsMap = new Map(projects.map((p) => [p.id, p.name]));

      // 1. Process Heatmap Data
      const dailyMap = new Map<string, number>();

      // 2. Process Distribution Data
      const distData: {
        date: string;
        projectName: string;
        duration: number;
      }[] = [];

      entries.forEach((entry) => {
        const dateKey = dayjs(entry.date).format('YYYY-MM-DD');

        // Heatmap
        const currentDuration = dailyMap.get(dateKey) || 0;
        dailyMap.set(dateKey, currentDuration + entry.duration);

        // Distribution
        const projectName = projectsMap.get(entry.project_id) || 'Sin Proyecto';
        // Aggregate by day and project if needed, or just push raw entries
        // Pushing raw entries is fine, the chart component aggregates by stacking
        // But for cleaner data, let's aggregate here if multiple entries for same project same day
        const existingDist = distData.find(
          (d) => d.date === dateKey && d.projectName === projectName,
        );
        if (existingDist) {
          existingDist.duration += entry.duration / 3600;
        } else {
          distData.push({
            date: dateKey,
            projectName: projectName,
            duration: entry.duration / 3600,
          });
        }
      });

      heatmapData.value = Array.from(dailyMap.entries()).map(
        ([date, seconds]) => [date, Number((seconds / 3600).toFixed(2))],
      );

      distributionData.value = distData;
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error),
    });
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Analíticas
      </h2>
      <button
        @click="fetchData"
        class="flex items-center justify-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        :disabled="isRefreshing"
      >
        <IconRefresh
          :class="['w-5 h-5 mr-2', isRefreshing ? 'animate-spin' : '']"
        />
        Refrescar
      </button>
    </div>

    <div
      v-if="isLoading && !heatmapData.length"
      class="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200"
    >
      <div
        class="w-8 h-8 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"
      ></div>
    </div>

    <template v-else>
      <!-- Distribution Section -->
      <section>
        <TimeDistributionChart :data="distributionData" :days-to-show="14" />
      </section>

      <!-- Heatmap Section -->
      <section>
        <HeatmapChart :data="heatmapData" :year="currentYear" />
      </section>
    </template>
  </div>
</template>
