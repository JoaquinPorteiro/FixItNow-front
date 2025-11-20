import { useMemo } from 'react';
import type { Availability, SimpleBooking } from '@/types';

export interface TimeBlock {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  isAvailable: boolean;
  isBooked: boolean;
}

interface UseTimeBlocksParams {
  selectedDate: string | null;
  availabilities: Availability[] | undefined;
  existingBookings?: SimpleBooking[];
}

/**
 * Hook to generate 1-hour time blocks based on service availability
 * and check against existing bookings
 */
export function useTimeBlocks({
  selectedDate,
  availabilities,
  existingBookings = [],
}: UseTimeBlocksParams): TimeBlock[] {
  return useMemo(() => {
    if (!selectedDate || !availabilities || availabilities.length === 0) {
      return [];
    }

    // Get day of week from date
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][
      date.getDay()
    ];

    // Find availabilities for this day
    const dayAvailabilities = availabilities.filter(
      (a) => a.dayOfWeek === dayOfWeek
    );

    if (dayAvailabilities.length === 0) {
      return [];
    }

    // Generate all possible 1-hour blocks from availabilities
    const blocks: TimeBlock[] = [];

    dayAvailabilities.forEach((availability) => {
      const [startHour, startMin] = availability.startTime.split(':').map(Number);
      const [endHour, endMin] = availability.endTime.split(':').map(Number);

      // Convert to minutes for easier calculation
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      // Generate 1-hour blocks (60 minutes each)
      for (let current = startMinutes; current < endMinutes; current += 60) {
        const blockEnd = current + 60;

        // Only create block if it fits completely within availability
        if (blockEnd <= endMinutes) {
          const blockStartHour = Math.floor(current / 60);
          const blockStartMin = current % 60;
          const blockEndHour = Math.floor(blockEnd / 60);
          const blockEndMin = blockEnd % 60;

          const blockStartTime = `${String(blockStartHour).padStart(2, '0')}:${String(blockStartMin).padStart(2, '0')}`;
          const blockEndTime = `${String(blockEndHour).padStart(2, '0')}:${String(blockEndMin).padStart(2, '0')}`;

          // Check if this block is already booked
          const isBooked = existingBookings.some((booking) => {
            // Only consider PENDING and CONFIRMED bookings
            if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
              return false;
            }

            // Check if there's any time overlap
            return (
              (booking.startTime <= blockStartTime && booking.endTime > blockStartTime) ||
              (booking.startTime < blockEndTime && booking.endTime >= blockEndTime) ||
              (booking.startTime >= blockStartTime && booking.endTime <= blockEndTime)
            );
          });

          blocks.push({
            startTime: blockStartTime,
            endTime: blockEndTime,
            isAvailable: !isBooked,
            isBooked,
          });
        }
      }
    });

    // Remove duplicates and sort by time
    const uniqueBlocks = blocks.filter(
      (block, index, self) =>
        index === self.findIndex(
          (b) => b.startTime === block.startTime && b.endTime === block.endTime
        )
    );

    return uniqueBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, availabilities, existingBookings]);
}
