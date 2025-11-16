'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useServices } from '@/hooks/useServices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ConsumerServicesPage() {
  const { services, isLoading } = useServices();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services?.filter((service) =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
        <h1 className="text-3xl font-bold mb-2">Explorar Servicios</h1>
        <p className="text-gray-600">Encuentra el servicio perfecto para tus necesidades</p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="search"
          placeholder="Buscar servicios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No se encontraron servicios.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  {service.isActive ? (
                    <Badge className="bg-green-100 text-green-800">Activo</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    ${service.price.toString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Proveedor:</span>{' '}
                    {service.provider?.firstName} {service.provider?.lastName}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/consumer/services/${service.id}`} className="w-full">
                  <Button className="w-full" disabled={!service.isActive}>
                    {service.isActive ? 'Ver Detalles y Reservar' : 'No Disponible'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
