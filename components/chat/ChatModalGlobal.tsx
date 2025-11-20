'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';
import { Booking } from '@/types';
import { ChatModal } from './ChatModal';
import { bookingsAPI } from '@/lib/api';

/**
 * Global Chat Modal controlled by ChatContext's currentChatBookingId
 * This modal opens automatically when a notification's "Abrir Chat" button is clicked
 *
 * NOTE: This modal does NOT render on pages that already have their own ChatModal
 * (bookings and dashboard pages) to avoid conflicts
 */
export function ChatModalGlobal() {
  const pathname = usePathname();
  const { currentChatBookingId, closeChat } = useChat();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pages that have their own ChatModal - don't render global modal here
  const pagesWithLocalChatModal = [
    '/consumer/bookings',
    '/consumer/dashboard',
    '/provider/bookings',
    '/provider/dashboard',
  ];

  const shouldRenderGlobalModal = !pagesWithLocalChatModal.includes(pathname);

  // Fetch booking data when currentChatBookingId changes
  useEffect(() => {
    const fetchBooking = async () => {
      if (!currentChatBookingId) {
        setBooking(null);
        return;
      }

      setIsLoading(true);
      try {
        const bookingData = await bookingsAPI.getById(currentChatBookingId);
        setBooking(bookingData);
      } catch (error) {
        console.error('Error fetching booking for chat:', error);
        // Close chat if booking cannot be fetched
        closeChat();
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [currentChatBookingId, closeChat]);

  // Don't render anything if:
  // - We're on a page that has its own ChatModal
  // - No chat is open
  // - Still loading booking data
  // - No booking data available
  if (!shouldRenderGlobalModal || !currentChatBookingId || isLoading || !booking) {
    return null;
  }

  return (
    <ChatModal
      booking={booking}
      isOpen={true}
      onClose={closeChat}
    />
  );
}
