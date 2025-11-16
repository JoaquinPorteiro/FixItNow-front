'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useServices } from '@/hooks/useServices';
import { servicesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProviderServicesPage() {
  const router = useRouter();
  const { services, isLoading, mutate } = useServices();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar el servicio "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await servicesAPI.delete(id);
      toast.success('Servicio eliminado correctamente');
      mutate();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al eliminar el servicio';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await servicesAPI.update(id, { isActive: !currentStatus });
      toast.success(`Servicio ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
      mutate();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar el servicio';
      toast.error(Array.isArray(message) ? message[0] : message);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Servicios</h1>
          <p className="text-gray-600">Gestiona los servicios que ofreces</p>
        </div>
        <Link href="/provider/services/new">
          <Button>Crear Nuevo Servicio</Button>
        </Link>
      </div>

      {/* Services Grid */}
      {!services || services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No has creado servicios aún.</p>
            <Link href="/provider/services/new">
              <Button>Crear Tu Primer Servicio</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  {service.isActive ? (
                    <Badge className="bg-green-100 text-green-800 shrink-0">Activo</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 shrink-0">Inactivo</Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-3">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-2xl font-bold text-primary">
                  ${service.price.toString()}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/provider/services/${service.id}/edit`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant={service.isActive ? 'secondary' : 'default'}
                    onClick={() => handleToggleActive(service.id, service.isActive)}
                    className="flex-1"
                  >
                    {service.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDelete(service.id, service.title)}
                  disabled={deletingId === service.id}
                >
                  {deletingId === service.id ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
