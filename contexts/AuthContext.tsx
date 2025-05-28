import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { supabase, checkSupabaseConfig } from '@/lib/supabase';

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check Supabase configuration first
    const config = checkSupabaseConfig();
    if (!config.configured) {
      console.warn('Supabase not configured. Auth will not work properly.');
      setError('Authentication service not configured');
      setLoading(false);
      return;
    }

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        setUser(session?.user ?? null);

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          if (!session?.user && !router.pathname.startsWith('/auth/') && router.pathname !== '/' && router.pathname !== '/landing') {
            router.push('/auth/signin');
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Session check error:', err);
        setError(err instanceof Error ? err.message : 'Failed to check authentication status');
        
        // In development, provide a fallback
        if (process.env.NODE_ENV === 'development') {
          console.warn('Auth error in development mode. Continuing without auth.');
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      router.push('/auth/signin');
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 