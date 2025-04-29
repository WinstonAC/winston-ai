import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useCallback } from 'react';
import { useRouter } from 'next/router';

export interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  signIn: (provider?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const handleSignIn = useCallback(async (provider?: string) => {
    try {
      if (provider) {
        await supabase.auth.signInWithOAuth({
          provider: provider as any,
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }, [supabase]);

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [supabase, router]);

  return {
    isAuthenticated: !!user,
    isLoading: false, // Supabase handles loading state internally
    user,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
} 