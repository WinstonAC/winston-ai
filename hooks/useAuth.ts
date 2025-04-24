import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';

export interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  signIn: (provider?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  const handleSignIn = useCallback(async (provider?: string) => {
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  return {
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    user: session?.user,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
} 