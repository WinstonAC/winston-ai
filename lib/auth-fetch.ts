import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback } from 'react';

interface AuthFetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export function useAuthFetch() {
  const session = useSession();
  const supabase = useSupabaseClient();

  const authFetch = useCallback(async (url: string, options: AuthFetchOptions = {}) => {
    const { headers = {}, ...restOptions } = options;

    // Prepare final headers object
    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add Authorization header if session exists
    if (session?.access_token) {
      finalHeaders['Authorization'] = `Bearer ${session.access_token}`;
    }

    // Log the final headers for debugging
    console.log('[useAuthFetch] Final headers:', finalHeaders);
    console.log('[useAuthFetch] Session exists:', !!session);
    console.log('[useAuthFetch] Access token exists:', !!session?.access_token);

    // Make the fetch request
    return fetch(url, {
      ...restOptions,
      headers: finalHeaders,
    });
  }, [session]);

  return authFetch;
}

// Helper function to get current session token (for use outside React components)
export async function getSessionToken(supabase: any): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('[getSessionToken] Error getting session:', error);
    return null;
  }
}

// Utility function for non-React contexts
export async function createAuthenticatedFetch(supabase: any) {
  const token = await getSessionToken(supabase);
  
  return (url: string, options: AuthFetchOptions = {}) => {
    const { headers = {}, ...restOptions } = options;

    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    console.log('[createAuthenticatedFetch] Final headers:', finalHeaders);
    console.log('[createAuthenticatedFetch] Token exists:', !!token);

    return fetch(url, {
      ...restOptions,
      headers: finalHeaders,
    });
  };
} 