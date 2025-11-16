import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">FixItNow</h1>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Conecta con Profesionales y Servicios
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            La plataforma que conecta proveedores de servicios con clientes.
            Ofrece tus servicios o encuentra el profesional que necesitas.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg">Comenzar Ahora</Button>
            </Link>
            <Link href="/public/services">
              <Button size="lg" variant="outline">Ver Servicios</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">¿Cómo Funciona?</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Para Proveedores</CardTitle>
              <CardDescription>Ofrece tus servicios profesionales</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Crea tu perfil de proveedor</li>
                <li>✓ Publica tus servicios</li>
                <li>✓ Define tu disponibilidad</li>
                <li>✓ Gestiona tus reservas</li>
                <li>✓ Confirma y completa trabajos</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Para Consumidores</CardTitle>
              <CardDescription>Encuentra el servicio que necesitas</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Explora servicios disponibles</li>
                <li>✓ Compara precios y proveedores</li>
                <li>✓ Reserva en horarios convenientes</li>
                <li>✓ Gestiona tus reservas</li>
                <li>✓ Califica tu experiencia</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proceso Simple</CardTitle>
              <CardDescription>Fácil y rápido</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Registro en minutos</li>
                <li>✓ Interfaz intuitiva</li>
                <li>✓ Notificaciones en tiempo real</li>
                <li>✓ Gestión centralizada</li>
                <li>✓ Soporte al cliente</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h3 className="text-3xl font-bold mb-4">¿Listo para Empezar?</h3>
          <p className="text-gray-600 mb-6">
            Únete a nuestra plataforma hoy y comienza a ofrecer o reservar servicios
          </p>
          <Link href="/auth/register">
            <Button size="lg">Crear Cuenta Gratis</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2024 FixItNow. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
