import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If user is logged in, redirect to dashboard
        router.push('/dashboard');
      } else {
        // If not logged in, show landing page
        router.push('/landing');
      }
    };

    checkSession();
  }, [router]);

  return null;
}