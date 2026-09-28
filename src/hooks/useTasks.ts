import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { DownloadTaskCollection } from '../types';

export function useTasks(refetchInterval = 1000) {
  return useQuery<DownloadTaskCollection>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await api.getAllTasks();
      return data;
    },
    refetchInterval,
  });
}

export function useRunningTasks(refetchInterval = 1000) {
  return useQuery({
    queryKey: ['tasks', 'running'],
    queryFn: async () => {
      const { data } = await api.getRunningTasks();
      return data;
    },
    refetchInterval,
  });
}

export function useFinishedTasks(refetchInterval = 1000) {
  return useQuery({
    queryKey: ['tasks', 'finished'],
    queryFn: async () => {
      const { data } = await api.getFinishedTasks();
      return data;
    },
    refetchInterval,
  });
}

export function useRemoveFinished() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.removeFinished(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useRemoveFailed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.removeFinishedFailed(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useRemoveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.removeFinishedById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
