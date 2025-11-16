import useSWR from 'swr';
import { bookingsAPI } from '@/lib/api';
import type { Booking } from '@/types';

export function useBookings() {
  const { data, error, isLoading, mutate } = useSWR<Booking[]>(
    '/bookings',
    bookingsAPI.getAll
  );

  return {
    bookings: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useBooking(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Booking>(
    id ? `/bookings/${id}` : null,
    id ? () => bookingsAPI.getById(id) : null
  );

  return {
    booking: data,
    isLoading,
    isError: error,
    mutate,
  };
}
