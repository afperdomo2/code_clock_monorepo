import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import api from '../services/api';
import type { Deliverable, Project } from '../types/project';
import type { TimeEntry } from '../types/time';
import { queryKeys } from './queryKeys';

export const useProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: async (): Promise<Project> => {
      const { data } = await api.get<Project>(`/projects/${projectId}`);
      return data;
    },
  });
};

export const useProjectTimeEntriesQuery = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.timeEntries(projectId),
    queryFn: async (): Promise<TimeEntry[]> => {
      const { data } = await api.get<{ data: TimeEntry[] }>('/time-entries', {
        params: { project_id: projectId, page: 1, limit: 100 },
      });
      return data.data;
    },
  });
};

export const useProjectDeliverablesQuery = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.deliverables(projectId),
    queryFn: async (): Promise<Deliverable[]> => {
      const { data } = await api.get<{ data: Deliverable[] }>('/deliverables', {
        params: { project_id: projectId, page: 1, limit: 100 },
      });
      return data.data;
    },
  });
};

export const useCreateDeliverableMutation = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      deadline?: string | null;
      completed?: boolean;
    }) => {
      const { data } = await api.post<Deliverable>('/deliverables', {
        project_id: projectId,
        ...payload,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliverables(projectId),
      });
    },
  });
};

export const useUpdateDeliverableMutation = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Pick<Deliverable, 'title' | 'deadline' | 'completed'>>;
    }) => {
      const { data } = await api.patch<Deliverable>(`/deliverables/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliverables(projectId),
      });
    },
  });
};

export const useDeleteDeliverableMutation = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/deliverables/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.deliverables(projectId),
      });
    },
  });
};
