import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // If user is logged in, redirect to dashboard
          router.push('/dashboard');
        } else {
          // If not logged in, show landing page
          router.push('/landing');
        }
      } catch (error) {
        console.error('Session check error:', error);
        // On error, redirect to landing
        router.push('/landing');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  // Render loading state instead of null
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#32CD32] mx-auto"></div>
          <p className="mt-4 text-lg text-white font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}