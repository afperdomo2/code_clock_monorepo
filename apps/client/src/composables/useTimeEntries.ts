import { useMutation, useQueryClient } from '@tanstack/vue-query';
import api from '../services/api';
import type { TimeEntryForm } from '../types/time';
import { queryKeys } from './queryKeys';

export type CreateTimeEntryInput = {
  projectId: string;
  payload: TimeEntryForm & { end_time?: string | null };
  durationMinutes: number;
};

export const useCreateTimeEntryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, payload, durationMinutes }: CreateTimeEntryInput) => {
      const { data } = await api.post<{ id: string } & TimeEntryForm>('/time-entries', payload);
      const { data: projectData } = await api.get<{ hours_spent: number }>(
        `/projects/${projectId}`,
      );
      const newTotal = (projectData.hours_spent || 0) + durationMinutes / 60;
      await api.patch(`/projects/${projectId}`, { hours_spent: newTotal });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeProjects });
      queryClient.invalidateQueries({
        queryKey: queryKeys.project(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.timeEntries(variables.projectId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
