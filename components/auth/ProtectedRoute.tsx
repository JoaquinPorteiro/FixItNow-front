'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: UserRole;
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (requireRole && user?.role !== requireRole) {
        // Redirect to appropriate dashboard based on user role
        if (user?.role === 'CONSUMER') {
          router.push('/consumer/dashboard');
        } else if (user?.role === 'PROVIDER') {
          router.push('/provider/dashboard');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, requireRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || (requireRole && user?.role !== requireRole)) {
    return null;
  }

  return <>{children}</>;
}
