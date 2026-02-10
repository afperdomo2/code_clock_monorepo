import { useQuery } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import api from '../services/api';
import { queryKeys } from './queryKeys';

type AnalyticsResult = {
  heatmapData: [string, number][];
  distributionData: { date: string; projectName: string; duration: number }[];
};

export const useAnalyticsQuery = (year: number) => {
  return useQuery({
    queryKey: queryKeys.analytics(year),
    queryFn: async (): Promise<AnalyticsResult> => {
      const startOfYear = dayjs(`${year}-01-01`).toISOString();
      const endOfYear = dayjs(`${year}-12-31`).endOf('day').toISOString();

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

      const projectsMap = new Map(projectsData.data.map((p) => [p.id, p.name]));
      const dailyMap = new Map<string, number>();
      const distData: {
        date: string;
        projectName: string;
        duration: number;
      }[] = [];

      entriesData.data.forEach((entry) => {
        const dateKey = dayjs(entry.date).format('YYYY-MM-DD');
        const currentDuration = dailyMap.get(dateKey) || 0;
        dailyMap.set(dateKey, currentDuration + entry.duration);

        const projectName = projectsMap.get(entry.project_id) || 'Sin Proyecto';
        const existingDist = distData.find(
          (d) => d.date === dateKey && d.projectName === projectName,
        );
        if (existingDist) {
          existingDist.duration += entry.duration / 3600;
        } else {
          distData.push({
            date: dateKey,
            projectName,
            duration: entry.duration / 3600,
          });
        }
      });

      const heatmapData: [string, number][] = Array.from(dailyMap.entries()).map(
        ([date, seconds]) => [date, Number((seconds / 3600).toFixed(2))],
      );

      return {
        heatmapData,
        distributionData: distData,
      };
    },
  });
};
