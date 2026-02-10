import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { Ref } from 'vue';
import api from '../services/api';
import type { ActivityEvent } from '../types/activity';
import type { TimeEntry } from '../types/time';
import { queryKeys } from './queryKeys';

export const useCalendarActivitiesQuery = (month: Ref<string>) => {
  return useQuery({
    queryKey: computed(() => queryKeys.calendar(month.value)),
    queryFn: async (): Promise<ActivityEvent[]> => {
      const [{ data: entriesData }, { data: projectsData }] = await Promise.all([
        api.get<TimeEntry[]>('/time-entries/by-month', {
          params: { month: month.value },
        }),
        api.get<{ data: { id: string; name: string }[] }>('/projects', {
          params: { page: 1, limit: 100 },
        }),
      ]);

      const projectsMap = new Map(projectsData.data.map((p) => [p.id, p.name]));

      return entriesData.map((entry) => ({
        id: entry.id,
        date: entry.date,
        title: entry.description || 'Sin descripcion',
        type: entry.activity_type || 'work',
        projectId: entry.project_id,
        projectName: projectsMap.get(entry.project_id),
        description: entry.description,
        duration: `${(entry.duration / 3600).toFixed(1).replace(/\.0$/, '')} horas`,
      }));
    },
  });
};
