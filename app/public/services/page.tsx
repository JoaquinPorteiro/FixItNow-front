'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Service } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function PublicServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Fetch services without authentication
        const response = await axios.get<Service[]>(`${API_BASE_URL}/services`);
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-primary">
              FixItNow
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/auth/login')}>
                Iniciar Sesión
              </Button>
              <Button onClick={() => router.push('/auth/register')}>
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Explora Nuestros Servicios</h1>
          <p className="text-xl text-gray-600">
            Encuentra profesionales para todas tus necesidades
          </p>
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

        {/* Call to Action Banner */}
        <Card className="bg-primary text-white">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  ¿Listo para contratar un servicio?
                </h2>
                <p className="text-white/90">
                  Crea una cuenta gratis para empezar a reservar servicios
                </p>
              </div>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => router.push('/auth/register')}
              >
                Registrarse Ahora
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              {searchTerm
                ? 'No se encontraron servicios que coincidan con tu búsqueda.'
                : 'No hay servicios disponibles en este momento.'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">Activo</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-primary">
                      ${service.price.toString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Proveedor:</span>{' '}
                      {service.provider?.firstName} {service.provider?.lastName}
                    </div>
                    {service.provider?.address && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Ubicación:</span>{' '}
                        {service.provider.address}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => router.push('/auth/register')}
                  >
                    Registrarse para Reservar
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Ya tienes cuenta?{' '}
                    <Link href="/auth/login" className="text-primary hover:underline">
                      Inicia sesión
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {filteredServices.length > 0 && (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">
              ¿Eres un profesional?
            </h3>
            <p className="text-gray-600 mb-6">
              Ofrece tus servicios y conecta con clientes potenciales
            </p>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/auth/register')}
            >
              Registrarse como Proveedor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
