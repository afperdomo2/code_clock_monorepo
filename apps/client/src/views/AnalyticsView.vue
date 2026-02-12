<script setup lang="ts">
import { IconRefresh } from '@tabler/icons-vue';
import dayjs from 'dayjs';
import { computed } from 'vue';
import HeatmapChart from '../components/dashboard/HeatmapChart.vue';
import TimeDistributionChart from '../components/dashboard/TimeDistributionChart.vue';
import SectionLayout from '../components/layouts/SectionLayout.vue';
import { useAnalyticsQuery } from '../composables/useAnalytics';
import { useAlertOnError } from '../composables/useAlertOnError';

const currentYear = dayjs().year();
const {
  data: analyticsData,
  isLoading,
  isFetching,
  error,
  refetch,
} = useAnalyticsQuery(currentYear);

useAlertOnError(error);

const heatmapData = computed(() => analyticsData.value?.heatmapData ?? []);
const distributionData = computed(() => analyticsData.value?.distributionData ?? []);
</script>

<template>
  <div class="space-y-8">
    <SectionLayout>
      <template #title>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Analíticas</h2>
      </template>

      <template #actions>
        <div class="flex-1 min-w-35">
          <button
            class="flex items-center justify-center w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="isFetching"
            @click="
              () => {
                void refetch();
              }
            "
          >
            <IconRefresh :class="['w-5 h-5 mr-2', isFetching ? 'animate-spin' : '']" />
            Refrescar
          </button>
        </div>
      </template>

      <template #content>
        <div
          v-if="isLoading && !heatmapData.length"
          class="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200"
        >
          <div
            class="w-8 h-8 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"
          />
        </div>

        <template v-else>
          <!-- Distribution Section -->
          <section>
            <TimeDistributionChart
              :data="distributionData"
              :days-to-show="14"
            />
          </section>

          <!-- Heatmap Section -->
          <section>
            <HeatmapChart
              :data="heatmapData"
              :year="currentYear"
            />
          </section>
        </template>
      </template>
    </SectionLayout>
  </div>
</template>
