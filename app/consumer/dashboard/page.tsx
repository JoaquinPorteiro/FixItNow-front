'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBookings } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import { ChatModal, ChatNotification } from '@/components/chat';
import { useChat } from '@/contexts/ChatContext';
import { Booking } from '@/types';

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

export default function ConsumerDashboard() {
  const { bookings, isLoading } = useBookings();
  const { unreadCount, currentChatBookingId } = useChat();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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

  const upcomingBookings = bookings?.filter(
    (b) => b.status !== 'CANCELLED' && b.status !== 'COMPLETED'
  ) || [];

  const recentBookings = bookings?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Bienvenido a tu panel de consumidor</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reservas Activas</CardTitle>
            <CardDescription>Pendientes y confirmadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingBookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Reservas</CardTitle>
            <CardDescription>Todas las reservas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookings?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completadas</CardTitle>
            <CardDescription>Servicios finalizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {bookings?.filter((b) => b.status === 'COMPLETED').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Link href="/consumer/services">
              <Button>Explorar Servicios</Button>
            </Link>
            <Link href="/consumer/bookings">
              <Button variant="outline">Ver Mis Reservas</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas Recientes</CardTitle>
          <CardDescription>Tus últimas 5 reservas</CardDescription>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tienes reservas aún.
              <Link href="/consumer/services" className="text-primary hover:underline ml-1">
                Explora servicios
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1 flex-1">
                    <h4 className="font-semibold">{booking.service?.title}</h4>
                    <p className="text-sm text-gray-600">
                      {format(new Date(booking.date), 'dd MMMM yyyy', { locale: es })} - {booking.startTime}
                    </p>
                    <p className="text-sm text-gray-500">
                      Proveedor: {booking.service?.provider?.firstName} {booking.service?.provider?.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[booking.status]}>
                      {statusLabels[booking.status]}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                      className="relative"
                    >
                      <MessageCircle size={18} className="mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Modal */}
      {selectedBooking && (
        <ChatModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
