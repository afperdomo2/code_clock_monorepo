<script setup lang="ts">
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { BarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, provide } from 'vue';
import VChart, { THEME_KEY } from 'vue-echarts';

dayjs.locale('es');

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

provide(THEME_KEY, 'light');

interface ChartDataEntry {
  date: string;
  projectName: string;
  duration: number; // in hours
}

const props = defineProps<{
  data: ChartDataEntry[];
  daysToShow?: number;
}>();

const processedData = computed(() => {
  // Generate dates for the current week (Monday to Sunday)
  const startOfWeek = dayjs().startOf('week');

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    weekDates.push(startOfWeek.add(i, 'day'));
  }

  const dateStrings = weekDates.map((d) => d.format('YYYY-MM-DD'));
  const displayDates = weekDates.map((d) => d.format('ddd DD'));

  // Get unique projects
  const projects = [...new Set(props.data.map((d) => d.projectName))];

  // Prepare series data
  const series = projects.map((project) => {
    return {
      name: project,
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series',
      },
      data: dateStrings.map((dateStr) => {
        const entry = props.data.find(
          (d) =>
            dayjs(d.date).format('YYYY-MM-DD') === dateStr &&
            d.projectName === project,
        );
        return entry ? Number(entry.duration.toFixed(2)) : 0;
      }),
    };
  });

  return {
    dates: displayDates,
    series,
  };
});

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formatter: (params: any[]) => {
      let result = `<div class="mb-1 font-bold">${params[0].axisValue}</div>`;
      let total = 0;
      params.forEach((p) => {
        if (p.value > 0) {
          total += p.value;
        }
      });

      params.forEach((p) => {
        if (p.value > 0) {
          const percentage =
            total > 0 ? ((p.value / total) * 100).toFixed(0) : 0;
          result += `
            <div class="flex items-center justify-between gap-4 text-xs">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full" style="background-color: ${p.color}"></span>
                ${p.seriesName}
              </span>
              <span class="font-mono">
                ${p.value}h <span class="text-gray-400">(${percentage}%)</span>
              </span>
            </div>
          `;
        }
      });
      result += `<div class="pt-1 mt-1 text-xs font-bold text-right border-t border-gray-200">Total: ${total.toFixed(2)}h</div>`;
      return result;
    },
  },
  legend: {
    bottom: 0,
    type: 'scroll',
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: processedData.value.dates,
    axisLabel: {
      interval: 0,
    },
  },
  yAxis: {
    type: 'value',
    name: 'Horas',
  },
  series: processedData.value.series,
}));
</script>

<template>
  <div class="w-full p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
    <h3 class="mb-4 text-lg font-semibold text-gray-800">
      Distribución de Tiempo (Semana Actual)
    </h3>
    <div class="h-[400px] w-full">
      <VChart class="chart" :option="option" autoresize />
    </div>
  </div>
</template>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>
