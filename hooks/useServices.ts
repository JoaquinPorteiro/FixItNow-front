import useSWR from 'swr';
import { servicesAPI } from '@/lib/api';
import type { Service } from '@/types';

export function useServices() {
  const { data, error, isLoading, mutate } = useSWR<Service[]>(
    '/services',
    servicesAPI.getAll
  );

  return {
    services: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useService(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Service>(
    id ? `/services/${id}` : null,
    id ? () => servicesAPI.getById(id) : null
  );

  return {
    service: data,
    isLoading,
    isError: error,
    mutate,
  };
}
