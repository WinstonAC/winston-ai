import { createBrowserClient } from '@supabase/ssr'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create the Supabase client
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Apply development patch to prevent getSessionFromUrl crash
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.warn('[🔥 HARD PATCH] Bypassing getSessionFromUrl to prevent crash');
  supabase.auth.getSessionFromUrl = async () => {
    return { data: null, error: null };
  };
} 