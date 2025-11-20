'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBookings } from '@/hooks/useBookings';
import { useChat } from '@/contexts/ChatContext';
import { bookingsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageCircle, Calendar, Clock, User, MapPin, FileText, XCircle } from 'lucide-react';
import { ChatModal } from '@/components/chat';
import { toast } from 'sonner';
import type { Booking, BookingStatus } from '@/types';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

export default function ConsumerBookingsPage() {
  const { bookings, isLoading, mutate } = useBookings();
  const { currentChatBookingId } = useChat();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Listen to currentChatBookingId from notifications
  // When a notification's "Abrir Chat" button is clicked, open that chat
  useEffect(() => {
    if (currentChatBookingId && bookings) {
      const booking = bookings.find(b => b.id === currentChatBookingId);
      if (booking) {
        setSelectedBooking(booking);
      }
    }
  }, [currentChatBookingId, bookings]);

  // Filter bookings by status
  const activeBookings = bookings?.filter(
    (b) => b.status === 'PENDING' || b.status === 'CONFIRMED'
  ) || [];

  const completedBookings = bookings?.filter(
    (b) => b.status === 'COMPLETED'
  ) || [];

  const cancelledBookings = bookings?.filter(
    (b) => b.status === 'CANCELLED'
  ) || [];

  // Calculate stats
  const stats = {
    total: bookings?.length || 0,
    pending: bookings?.filter(b => b.status === 'PENDING').length || 0,
    confirmed: bookings?.filter(b => b.status === 'CONFIRMED').length || 0,
    completed: completedBookings.length,
  };

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;

    setIsCancelling(true);
    try {
      await bookingsAPI.updateStatus(bookingToCancel.id, { status: 'CANCELLED' });
      toast.success('Reserva cancelada exitosamente');
      mutate(); // Refresh bookings list
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Error al cancelar la reserva');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDateTime = (date: string, startTime: string, endTime: string) => {
    try {
      const dateObj = new Date(date);
      const formattedDate = format(dateObj, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
      return {
        date: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1),
        time: `${startTime} - ${endTime}`,
      };
    } catch (error) {
      return { date: date, time: `${startTime} - ${endTime}` };
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const { date, time } = formatDateTime(booking.date, booking.startTime, booking.endTime);
    const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-1">{booking.service?.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {booking.service?.description}
              </CardDescription>
            </div>
            <Badge className={statusColors[booking.status]}>
              {statusLabels[booking.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date and Time */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="h-4 w-4 mt-0.5 text-gray-500" />
              <span>{date}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Clock className="h-4 w-4 mt-0.5 text-gray-500" />
              <span>{time}</span>
            </div>
          </div>

          {/* Provider Info */}
          {booking.service?.provider && (
            <div className="pt-3 border-t space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <User className="h-4 w-4 mt-0.5 text-gray-500" />
                <div>
                  <div className="font-medium">
                    {booking.service.provider.firstName} {booking.service.provider.lastName}
                  </div>
                  <div className="text-gray-600">{booking.service.provider.email}</div>
                  <div className="text-gray-600">{booking.service.provider.phone}</div>
                </div>
              </div>
              {booking.service.provider.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                  <span className="text-gray-600">{booking.service.provider.address}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="pt-3 border-t">
              <div className="flex items-start gap-2 text-sm">
                <FileText className="h-4 w-4 mt-0.5 text-gray-500" />
                <div>
                  <div className="font-medium mb-1">Notas:</div>
                  <div className="text-gray-600">{booking.notes}</div>
                </div>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="pt-3 border-t">
            <div className="text-2xl font-bold text-primary">
              ${booking.service?.price.toString()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setSelectedBooking(booking)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Link href={`/consumer/services/${booking.serviceId}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Ver Servicio
              </Button>
            </Link>
            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelClick(booking)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Mis Reservas</h1>
        <p className="text-gray-600">Gestiona todas tus reservas de servicios</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confirmadas</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.confirmed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completadas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="active">
            Activas ({activeBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({completedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">No tienes reservas activas</p>
                <Link href="/consumer/services">
                  <Button>Explorar Servicios</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                No tienes reservas completadas
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                No tienes reservas canceladas
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {cancelledBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Chat Modal */}
      {selectedBooking && (
        <ChatModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta reserva?
              {bookingToCancel && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{bookingToCancel.service?.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDateTime(
                      bookingToCancel.date,
                      bookingToCancel.startTime,
                      bookingToCancel.endTime
                    ).date}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(
                      bookingToCancel.date,
                      bookingToCancel.startTime,
                      bookingToCancel.endTime
                    ).time}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isCancelling}
            >
              No, mantener
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelando...' : 'Sí, cancelar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
