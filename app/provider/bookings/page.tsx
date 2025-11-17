'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBookings } from '@/hooks/useBookings';
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
import { MessageCircle, Calendar, Clock, User, MapPin, FileText, CheckCircle, XCircle } from 'lucide-react';
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

export default function ProviderBookingsPage() {
  const { bookings, isLoading, mutate } = useBookings();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [bookingToUpdate, setBookingToUpdate] = useState<{ booking: Booking; newStatus: BookingStatus } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter bookings by status
  const pendingBookings = bookings?.filter(b => b.status === 'PENDING') || [];
  const confirmedBookings = bookings?.filter(b => b.status === 'CONFIRMED') || [];
  const completedBookings = bookings?.filter(b => b.status === 'COMPLETED') || [];
  const cancelledBookings = bookings?.filter(b => b.status === 'CANCELLED') || [];

  // Calculate stats
  const stats = {
    total: bookings?.length || 0,
    pending: pendingBookings.length,
    confirmed: confirmedBookings.length,
    completed: completedBookings.length,
  };

  const handleStatusClick = (booking: Booking, newStatus: BookingStatus) => {
    setBookingToUpdate({ booking, newStatus });
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!bookingToUpdate) return;

    setIsUpdating(true);
    try {
      await bookingsAPI.updateStatus(bookingToUpdate.booking.id, { status: bookingToUpdate.newStatus });
      toast.success(`Reserva ${statusLabels[bookingToUpdate.newStatus].toLowerCase()} exitosamente`);
      mutate(); // Refresh bookings list
      setStatusDialogOpen(false);
      setBookingToUpdate(null);
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar la reserva');
    } finally {
      setIsUpdating(false);
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

  const getStatusActionLabel = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'confirmar';
      case 'COMPLETED':
        return 'completar';
      case 'CANCELLED':
        return 'cancelar';
      default:
        return 'actualizar';
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const { date, time } = formatDateTime(booking.date, booking.startTime, booking.endTime);

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

          {/* Consumer Info */}
          {booking.consumer && (
            <div className="pt-3 border-t space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <User className="h-4 w-4 mt-0.5 text-gray-500" />
                <div>
                  <div className="font-medium">
                    {booking.consumer.firstName} {booking.consumer.lastName}
                  </div>
                  <div className="text-gray-600">{booking.consumer.email}</div>
                  <div className="text-gray-600">{booking.consumer.phone}</div>
                </div>
              </div>
              {booking.consumer.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                  <span className="text-gray-600">{booking.consumer.address}</span>
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
                  <div className="font-medium mb-1">Notas del cliente:</div>
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
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedBooking(booking)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Link href={`/provider/services`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Mis Servicios
                </Button>
              </Link>
            </div>

            {/* Status Actions */}
            {booking.status === 'PENDING' && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStatusClick(booking, 'CONFIRMED')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStatusClick(booking, 'CANCELLED')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            )}

            {booking.status === 'CONFIRMED' && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusClick(booking, 'COMPLETED')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar Completada
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleStatusClick(booking, 'CANCELLED')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
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
        <h1 className="text-3xl font-bold mb-2">Gestión de Reservas</h1>
        <p className="text-gray-600">Administra las reservas de tus servicios</p>
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
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="pending">
            Pendientes ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmadas ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({completedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No tienes reservas pendientes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          {confirmedBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                No tienes reservas confirmadas
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {confirmedBookings.map((booking) => (
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

      {/* Status Update Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bookingToUpdate && `${statusLabels[bookingToUpdate.newStatus]} Reserva`}
            </DialogTitle>
            <DialogDescription>
              {bookingToUpdate && (
                <>
                  ¿Estás seguro de que deseas {getStatusActionLabel(bookingToUpdate.newStatus)} esta reserva?
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">{bookingToUpdate.booking.service?.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Cliente: {bookingToUpdate.booking.consumer?.firstName}{' '}
                      {bookingToUpdate.booking.consumer?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(
                        bookingToUpdate.booking.date,
                        bookingToUpdate.booking.startTime,
                        bookingToUpdate.booking.endTime
                      ).date}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(
                        bookingToUpdate.booking.date,
                        bookingToUpdate.booking.startTime,
                        bookingToUpdate.booking.endTime
                      ).time}
                    </p>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStatusConfirm}
              disabled={isUpdating}
              variant={bookingToUpdate?.newStatus === 'CANCELLED' ? 'destructive' : 'default'}
            >
              {isUpdating ? 'Actualizando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
