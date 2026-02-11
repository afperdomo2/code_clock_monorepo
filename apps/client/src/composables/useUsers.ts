import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import api from '../services/api';
import type { UserProfile } from '../types';
import { queryKeys } from './queryKeys';

export type UserCreatePayload = {
  email: string;
  password: string;
  name?: string;
};

export type UserUpdatePayload = {
  email?: string;
  name?: string;
};

type UsersResponse = {
  data: UserProfile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export const useUsersQuery = (search: Ref<string>) => {
  return useQuery({
    queryKey: computed(() => queryKeys.users(search.value)),
    queryFn: async (): Promise<UsersResponse> => {
      const { data } = await api.get<UsersResponse>('/users', {
        params: { page: 1, limit: 100, search: search.value || undefined },
      });
      return data;
    },
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UserCreatePayload) => {
      const { data } = await api.post<UserProfile>('/users', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usersRoot });
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UserUpdatePayload }) => {
      const { data } = await api.patch<UserProfile>(`/users/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usersRoot });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usersRoot });
    },
  });
};
