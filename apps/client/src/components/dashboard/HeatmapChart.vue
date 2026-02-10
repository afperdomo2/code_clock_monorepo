<script setup lang="ts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { HeatmapChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { provide, computed } from 'vue';
import dayjs from 'dayjs';

use([
  CanvasRenderer,
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
]);

provide(THEME_KEY, 'light');

const props = defineProps<{
  data: [string, number][];
  year: number;
}>();

const option = computed(() => ({
  tooltip: {
    position: 'top',
    formatter: function (p: { data: [string, number] }) {
      const format = dayjs(p.data[0]).format('DD MMM, YYYY');
      return `${format}: ${p.data[1]} horas`;
    },
  },
  visualMap: {
    min: 0,
    max: 10,
    calculable: false,
    orient: 'horizontal',
    left: 'center',
    bottom: '10',
    inRange: {
      color: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    },
    show: false, // Hide the visual map controller for a cleaner look like GitHub
  },
  calendar: {
    top: 30,
    left: 30,
    right: 30,
    cellSize: ['auto', 13],
    range: props.year,
    itemStyle: {
      borderWidth: 0.5,
    },
    yearLabel: { show: false },
    dayLabel: {
      firstDay: 1, // Start week on Monday
      nameMap: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    },
    monthLabel: {
      nameMap: [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ],
    },
  },
  series: {
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: props.data,
  },
}));
</script>

<template>
  <div
    class="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
  >
    <h3 class="mb-4 text-lg font-semibold text-gray-800">
      Actividad ({{ year }})
    </h3>
    <div class="h-[180px] min-w-[700px]">
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
