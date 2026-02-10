import { useQuery } from '@tanstack/vue-query';
import api from '../services/api';
import type { ActivityEvent } from '../types/activity';
import type { TimeEntry } from '../types/time';
import { queryKeys } from './queryKeys';

export const useCalendarActivitiesQuery = () => {
  return useQuery({
    queryKey: queryKeys.calendar,
    queryFn: async (): Promise<ActivityEvent[]> => {
      const [{ data: entriesData }, { data: projectsData }] = await Promise.all([
        api.get<{ data: TimeEntry[] }>('/time-entries', {
          params: { page: 1, limit: 100 },
        }),
        api.get<{ data: { id: string; name: string }[] }>('/projects', {
          params: { page: 1, limit: 100 },
        }),
      ]);

      const projectsMap = new Map(projectsData.data.map((p) => [p.id, p.name]));

      return entriesData.data.map((entry) => ({
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
