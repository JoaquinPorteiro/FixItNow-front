'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useService } from '@/hooks/useServices';
import { useAvailabilities } from '@/hooks/useAvailabilities';
import { useTimeBlocks, type TimeBlock } from '@/hooks/useTimeBlocks';
import { bookingsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TimeBlockSelector } from '@/components/TimeBlockSelector';
import { toast } from 'sonner';
import type { DayOfWeek } from '@/types';

const DAY_NAMES: Record<DayOfWeek, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const { service, isLoading: serviceLoading } = useService(serviceId);
  const { availabilities, isLoading: availabilitiesLoading } = useAvailabilities(serviceId);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Fetch existing bookings for the selected date
  const { data: existingBookings } = useSWR(
    selectedDate ? `/bookings/service/${serviceId}?date=${selectedDate}` : null,
    () => bookingsAPI.getServiceBookings(serviceId, selectedDate),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Generate time blocks based on selected date and availabilities
  const timeBlocks = useTimeBlocks({
    selectedDate: selectedDate || null,
    availabilities,
    existingBookings: existingBookings || [],
  });

  // Helper to get day of week from date
  const getDayOfWeek = (dateString: string): DayOfWeek => {
    // Parse date manually to avoid timezone issues
    // dateString format: YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in JS
    const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  };

  // Reset selected block when date changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedBlock(null); // Clear block selection when date changes
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that date and time block are selected
    if (!selectedDate) {
      toast.error('Por favor selecciona una fecha');
      return;
    }

    if (!selectedBlock) {
      toast.error('Por favor selecciona un bloque de tiempo');
      return;
    }

    const bookingData = {
      serviceId,
      date: selectedDate,
      startTime: selectedBlock.startTime,
      endTime: selectedBlock.endTime,
      ...(notes.trim() && { notes: notes.trim() }),
    };

    console.log('Creating booking with data:', bookingData);

    setIsBooking(true);
    try {
      await bookingsAPI.create(bookingData);

      toast.success('Reserva creada exitosamente');
      router.push('/consumer/bookings');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = Array.isArray(error.response?.data?.message)
        ? error.response.data.message.join(', ')
        : error.response?.data?.message || 'Error al crear la reserva';
      toast.error(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  if (serviceLoading || availabilitiesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Servicio no encontrado</h2>
        <Button onClick={() => router.push('/consumer/services')}>
          Volver a servicios
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Service Details */}
      <div>
        <Button
          variant="outline"
          onClick={() => router.push('/consumer/services')}
          className="mb-4"
        >
          ← Volver
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{service.title}</CardTitle>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </div>
              {service.isActive ? (
                <Badge className="bg-green-100 text-green-800">Activo</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                ${service.price.toString()}
              </span>
              <span className="text-gray-600">por sesión</span>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Proveedor</h3>
              <div className="space-y-1 text-gray-700">
                <p>
                  <span className="font-medium">Nombre:</span>{' '}
                  {service.provider?.firstName} {service.provider?.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  {service.provider?.email}
                </p>
                <p>
                  <span className="font-medium">Teléfono:</span>{' '}
                  {service.provider?.phone}
                </p>
                {service.provider?.address && (
                  <p>
                    <span className="font-medium">Dirección:</span>{' '}
                    {service.provider.address}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Horarios Disponibles</CardTitle>
          <CardDescription>
            Revisa cuidadosamente los días y horarios disponibles antes de reservar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!availabilities || availabilities.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 font-medium">⚠️ Sin horarios disponibles</p>
              <p className="text-yellow-700 text-sm mt-2">
                Este servicio no tiene horarios configurados. Contacta al proveedor.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Importante:</strong> Solo puedes reservar en los días y horarios listados abajo.
                  Asegúrate de que tu reserva esté completamente dentro de estos rangos.
                </p>
              </div>
              <div className="grid gap-3">
                {availabilities
                  .sort((a, b) => {
                    const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
                    return days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
                  })
                  .map((availability) => (
                    <div
                      key={availability.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <span className="font-semibold text-gray-800">
                        {DAY_NAMES[availability.dayOfWeek]}
                      </span>
                      <span className="text-gray-700 font-mono bg-white px-3 py-1 rounded border">
                        {availability.startTime} - {availability.endTime}
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Booking Form */}
      {service.isActive && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Reservar Servicio</CardTitle>
              <CardDescription>
                Selecciona la fecha y luego el bloque horario de 1 hora que prefieras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* Time Block Selector */}
                {selectedDate && (
                  <TimeBlockSelector
                    blocks={timeBlocks}
                    selectedBlock={selectedBlock}
                    onSelectBlock={setSelectedBlock}
                    isLoading={availabilitiesLoading}
                  />
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Agrega cualquier información adicional para el proveedor..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isBooking || !selectedDate || !selectedBlock}
                >
                  {isBooking ? 'Reservando...' : 'Confirmar Reserva'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
