'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useService } from '@/hooks/useServices';
import { useAvailabilities } from '@/hooks/useAvailabilities';
import { servicesAPI, availabilitiesAPI } from '@/lib/api';
import { updateServiceSchema, createAvailabilitySchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Trash2, Plus, Clock } from 'lucide-react';
import type { UpdateServiceDto, DayOfWeek, Availability, CreateAvailabilityDto } from '@/types';

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

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const { service, isLoading: serviceLoading, mutate: mutateService } = useService(serviceId);
  const { availabilities, isLoading: availabilitiesLoading, mutate: mutateAvailabilities } = useAvailabilities(serviceId);

  // Service form state
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<UpdateServiceDto>({
    resolver: zodResolver(updateServiceSchema),
    values: service ? {
      title: service.title,
      description: service.description,
      price: service.price,
      isActive: service.isActive,
    } : undefined,
  });

  // Availability form state
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [availabilityToDelete, setAvailabilityToDelete] = useState<Availability | null>(null);
  const [isDeletingAvailability, setIsDeletingAvailability] = useState(false);

  // Update service
  const onSubmitService = async (data: UpdateServiceDto) => {
    setIsUpdatingService(true);
    try {
      await servicesAPI.update(serviceId, data);
      toast.success('Servicio actualizado exitosamente');
      mutateService();
    } catch (error: any) {
      console.error('Update service error:', error);
      const message = error.response?.data?.message || 'Error al actualizar el servicio';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsUpdatingService(false);
    }
  };

  // Add availability
  const handleAddAvailability = async () => {
    // Format times to ensure HH:mm
    const formatTime = (time: string): string => {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    // Validate
    if (startTime >= endTime) {
      toast.error('La hora de inicio debe ser menor que la hora de fin');
      return;
    }

    // Check for duplicates
    const hasDuplicate = availabilities?.some(
      a => a.dayOfWeek === selectedDay &&
      a.startTime === formatTime(startTime) &&
      a.endTime === formatTime(endTime)
    );

    if (hasDuplicate) {
      toast.error('Ya existe una disponibilidad con este día y horario');
      return;
    }

    setIsAddingAvailability(true);
    try {
      const data: CreateAvailabilityDto = {
        serviceId,
        dayOfWeek: selectedDay,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
      };

      await availabilitiesAPI.create(data);
      toast.success('Disponibilidad agregada exitosamente');
      mutateAvailabilities();
      mutateService(); // Also refresh service to update availabilities

      // Reset form
      setStartTime('09:00');
      setEndTime('17:00');
    } catch (error: any) {
      console.error('Add availability error:', error);
      const message = error.response?.data?.message || 'Error al agregar disponibilidad';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsAddingAvailability(false);
    }
  };

  // Delete availability
  const handleDeleteClick = (availability: Availability) => {
    setAvailabilityToDelete(availability);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!availabilityToDelete) return;

    setIsDeletingAvailability(true);
    try {
      await availabilitiesAPI.delete(availabilityToDelete.id);
      toast.success('Disponibilidad eliminada exitosamente');
      mutateAvailabilities();
      mutateService();
      setDeleteDialogOpen(false);
      setAvailabilityToDelete(null);
    } catch (error: any) {
      console.error('Delete availability error:', error);
      const message = error.response?.data?.message || 'Error al eliminar disponibilidad';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsDeletingAvailability(false);
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
        <Button onClick={() => router.push('/provider/services')}>
          Volver a Mis Servicios
        </Button>
      </div>
    );
  }

  // Group availabilities by day
  const availabilitiesByDay = DAYS_ORDER.map(day => ({
    day,
    items: availabilities?.filter(a => a.dayOfWeek === day) || []
  })).filter(group => group.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Editar Servicio</h1>
          <p className="text-gray-600">Modifica la información y disponibilidades de tu servicio</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/provider/services')}
        >
          ← Volver
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="info">Información Básica</TabsTrigger>
          <TabsTrigger value="availability">
            Disponibilidad
            {availabilities && availabilities.length > 0 && (
              <Badge className="ml-2 bg-green-600">{availabilities.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Information */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Servicio</CardTitle>
              <CardDescription>Actualiza los detalles de tu servicio</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitService)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Servicio</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Reparación de computadoras"
                    {...register('title')}
                    disabled={isUpdatingService}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describe tu servicio en detalle..."
                    {...register('description')}
                    disabled={isUpdatingService}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Precio ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register('price', { valueAsNumber: true })}
                    disabled={isUpdatingService}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="h-4 w-4 rounded border-gray-300"
                    {...register('isActive')}
                    disabled={isUpdatingService}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Servicio activo (visible para consumidores)
                  </Label>
                </div>

                <Button type="submit" disabled={isUpdatingService} className="w-full">
                  {isUpdatingService ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Availability */}
        <TabsContent value="availability" className="space-y-4">
          {/* Existing Availabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Horarios Configurados</CardTitle>
              <CardDescription>
                {availabilities && availabilities.length > 0
                  ? 'Gestiona tus horarios de disponibilidad'
                  : 'Aún no has configurado horarios de disponibilidad'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!availabilities || availabilities.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                  <p className="text-yellow-800 font-medium mb-2">
                    Sin horarios disponibles
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Agrega al menos un horario para que los clientes puedan hacer reservas
                  </p>
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
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(availability)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Agregar Disponibilidad
              </CardTitle>
              <CardDescription>
                Define un nuevo horario de disponibilidad para tu servicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Día de la semana</Label>
                  <Select value={selectedDay} onValueChange={(value) => setSelectedDay(value as DayOfWeek)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_ORDER.map(day => (
                        <SelectItem key={day} value={day}>
                          {DAY_NAMES[day]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Hora de inicio</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">Hora de fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Vista previa:</strong> {DAY_NAMES[selectedDay]} de {startTime} a {endTime}
                  </p>
                </div>

                <Button
                  onClick={handleAddAvailability}
                  disabled={isAddingAvailability}
                  className="w-full"
                >
                  {isAddingAvailability ? 'Agregando...' : 'Agregar Disponibilidad'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Disponibilidad</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta disponibilidad?
              {availabilityToDelete && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{DAY_NAMES[availabilityToDelete.dayOfWeek]}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {availabilityToDelete.startTime} - {availabilityToDelete.endTime}
                  </p>
                </div>
              )}
              <p className="mt-4 text-sm text-yellow-700">
                <strong>Nota:</strong> Los clientes no podrán hacer reservas en este horario.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeletingAvailability}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeletingAvailability}
            >
              {isDeletingAvailability ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
