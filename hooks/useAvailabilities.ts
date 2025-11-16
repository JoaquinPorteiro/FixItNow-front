import useSWR from 'swr';
import { availabilitiesAPI } from '@/lib/api';
import type { Availability } from '@/types';

export function useAvailabilities(serviceId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Availability[]>(
    serviceId ? `/availabilities?serviceId=${serviceId}` : null,
    serviceId ? () => availabilitiesAPI.getByServiceId(serviceId) : null
  );

  return {
    availabilities: data,
    isLoading,
    isError: error,
    mutate,
  };
}
