'use client';

import { useParams, useRouter } from 'next/navigation';
import { useService } from '@/hooks/useServices';
import { useAvailabilities } from '@/hooks/useAvailabilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, Edit } from 'lucide-react';
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

const DAYS_ORDER: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function ProviderServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const { service, isLoading: serviceLoading } = useService(serviceId);
  const { availabilities, isLoading: availabilitiesLoading } = useAvailabilities(serviceId);

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
        <Button onClick={() => router.push('/provider/services')}>
          Volver a Mis Servicios
        </Button>
      </div>
    );
  }

  const availabilitiesByDay = DAYS_ORDER.map(day => ({
    day,
    items: availabilities?.filter(a => a.dayOfWeek === day) || []
  })).filter(group => group.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
          <p className="text-gray-600">Vista detallada de tu servicio</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/provider/services')}
          >
            ← Volver
          </Button>
          <Button onClick={() => router.push(`/provider/services/${serviceId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
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
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Precio</p>
              <p className="text-3xl font-bold text-primary">
                ${service.price.toString()}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold">Estado del Servicio</h3>
            </div>
            <p className="text-gray-600">
              {service.isActive
                ? 'Este servicio está activo y visible para los consumidores'
                : 'Este servicio está inactivo y no es visible para los consumidores'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Availabilities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Horarios de Disponibilidad
              </CardTitle>
              <CardDescription>
                Horarios en los que los clientes pueden reservar
              </CardDescription>
            </div>
            {availabilities && availabilities.length > 0 && (
              <Badge className="bg-blue-600">{availabilities.length} horarios</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!availabilities || availabilities.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
              <p className="text-yellow-800 font-medium mb-2">
                Sin horarios disponibles
              </p>
              <p className="text-yellow-700 text-sm mb-4">
                Configura horarios para que los clientes puedan hacer reservas
              </p>
              <Button onClick={() => router.push(`/provider/services/${serviceId}/edit`)}>
                Configurar Horarios
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {availabilitiesByDay.map(group => (
                <div key={group.day} className="space-y-2">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Badge variant="outline">{DAY_NAMES[group.day]}</Badge>
                  </h3>
                  <div className="space-y-2 pl-4">
                    {group.items.map(availability => (
                      <div
                        key={availability.id}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg"
                      >
                        <span className="font-mono text-gray-700">
                          {availability.startTime} - {availability.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(`/provider/services/${serviceId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Servicio y Disponibilidades
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push('/provider/bookings')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Ver Reservas de Este Servicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
