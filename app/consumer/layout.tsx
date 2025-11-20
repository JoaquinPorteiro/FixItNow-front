'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatModalGlobal, NotificationsDropdown } from '@/components/chat';

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: '/consumer/dashboard', label: 'Dashboard' },
    { href: '/consumer/services', label: 'Explorar Servicios' },
    { href: '/consumer/bookings', label: 'Mis Reservas' },
  ];

  return (
    <ProtectedRoute requireRole="CONSUMER">
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <nav className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/consumer/dashboard">
                  <h1 className="text-2xl font-bold">FixItNow</h1>
                </Link>
                <div className="flex gap-4">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <span
                        className={cn(
                          'text-sm font-medium transition-colors hover:text-primary',
                          pathname === link.href
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      >
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Notifications Dropdown */}
                <NotificationsDropdown />

                <span className="text-sm text-muted-foreground">
                  {user?.firstName} {user?.lastName}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">{children}</main>

        {/* Global Chat Modal */}
        <ChatModalGlobal />
      </div>
    </ProtectedRoute>
  );
}
