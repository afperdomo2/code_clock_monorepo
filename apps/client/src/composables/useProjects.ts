import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { ProjectStatus } from '../enums';
import api from '../services/api';
import type { Project } from '../types/project';
import { queryKeys } from './queryKeys';

export type ProjectPayload = {
  name: string;
  client?: string | null;
  category: Project['category'];
  priority: Project['priority'];
  status: Project['status'];
  hours_estimated?: number | null;
  hours_spent?: number | null;
  deadline?: string | null;
  description?: string | null;
};

export const useProjectsQuery = () => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async (): Promise<Project[]> => {
      const { data } = await api.get<{ data: Project[] }>('/projects', {
        params: { page: 1, limit: 100 },
      });
      return data.data;
    },
  });
};

export const useActiveProjectsQuery = () => {
  return useQuery({
    queryKey: queryKeys.activeProjects,
    queryFn: async (): Promise<{ id: string; name: string }[]> => {
      const { data } = await api.get<{ data: { id: string; name: string }[] }>('/projects', {
        params: { status: ProjectStatus.ACTIVO, page: 1, limit: 100 },
      });
      return data.data;
    },
  });
};

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProjectPayload) => {
      const { data } = await api.post<Project>('/projects', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeProjects });
    },
  });
};

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<ProjectPayload> }) => {
      const { data } = await api.patch<Project>(`/projects/${id}`, payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeProjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.project(data.id) });
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeProjects });
      queryClient.invalidateQueries({ queryKey: queryKeys.project(id) });
    },
  });
};
