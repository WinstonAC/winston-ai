import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Loader } from './ui/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !router.isReady || authLoading) {
      return;
    }

    if (!user) {
      router.push({
        pathname: '/auth/signin',
        query: { returnUrl: router.asPath }
      });
    } else if (requiredRole && user.role !== requiredRole) {
      setError('You do not have permission to access this page');
    }
  }, [isClient, user, authLoading, router, requiredRole]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isClient || !router.isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl font-semibold mb-4">{error}</div>
        <button
          onClick={() => router.push('/campaigns')}
          className="text-blue-500 hover:text-blue-600"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
} 