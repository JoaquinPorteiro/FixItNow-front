'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useServices } from '@/hooks/useServices';
import { useBookings } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import { ChatModal } from '@/components/chat';
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

export default function ProviderDashboard() {
  const { services, isLoading: servicesLoading } = useServices();
  const { bookings, isLoading: bookingsLoading } = useBookings();
  const { unreadCount } = useChat();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const pendingBookings = bookings?.filter((b) => b.status === 'PENDING') || [];
  const activeServices = services?.filter((s) => s.isActive) || [];

  if (servicesLoading || bookingsLoading) {
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
        <p className="text-gray-600">Bienvenido a tu panel de proveedor</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Servicios Activos</CardTitle>
            <CardDescription>Disponibles para reserva</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeServices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Servicios</CardTitle>
            <CardDescription>Activos e inactivos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{services?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservas Pendientes</CardTitle>
            <CardDescription>Esperando confirmación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingBookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Reservas</CardTitle>
            <CardDescription>Todas las reservas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bookings?.length || 0}</div>
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
            <Link href="/provider/services/new">
              <Button>Crear Nuevo Servicio</Button>
            </Link>
            <Link href="/provider/services">
              <Button variant="outline">Ver Mis Servicios</Button>
            </Link>
            <Link href="/provider/bookings">
              <Button variant="outline">Gestionar Reservas</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Pending Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas Pendientes</CardTitle>
          <CardDescription>Requieren tu confirmación</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay reservas pendientes.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1 flex-1">
                    <h4 className="font-semibold">{booking.service?.title}</h4>
                    <p className="text-sm text-gray-600">
                      {format(new Date(booking.date), 'dd MMMM yyyy', { locale: es })} - {booking.startTime}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cliente: {booking.consumer?.firstName} {booking.consumer?.lastName}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
                    <Link href="/provider/bookings">
                      <Button size="sm">Gestionar</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Services */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Servicios</CardTitle>
          <CardDescription>Servicios que ofreces</CardDescription>
        </CardHeader>
        <CardContent>
          {services && services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No has creado servicios aún.
              <Link href="/provider/services/new" className="text-primary hover:underline ml-1">
                Crear tu primer servicio
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {services?.slice(0, 5).map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{service.title}</h4>
                      {service.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Activo</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">{service.description}</p>
                    <p className="text-sm font-medium text-primary">${service.price.toString()}</p>
                  </div>
                  <Link href={`/provider/services/${service.id}`}>
                    <Button size="sm" variant="outline">Editar</Button>
                  </Link>
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
