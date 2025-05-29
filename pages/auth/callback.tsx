import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('[Callback] Starting auth callback processing...')
        console.log('[Callback] Current URL:', window.location.href)
        
        // Parse both URL query parameters and hash fragments
        const urlParams = new URLSearchParams(window.location.search)
        const urlHash = new URLSearchParams(window.location.hash.substring(1))
        console.log('[Callback] URL Query Parameters:', Object.fromEntries(urlParams.entries()));
        console.log('[Callback] URL Hash Parameters:', Object.fromEntries(urlHash.entries()));
        
        const error_code = urlParams.get('error') || urlHash.get('error')
        const error_description = urlParams.get('error_description') || urlHash.get('error_description')

        // Handle error from auth provider
        if (error_code) {
          console.error('[Callback] Auth provider error:', error_description || error_code)
          setError("Session invalid or expired. Please log in again.")
          setTimeout(() => {
            window.location.href = '/auth/signin?error=auth_provider_error'
          }, 2000)
          return
        }

        // For implicit flow, let Supabase handle the session automatically
        console.log('[Callback] Checking for existing session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('[Callback] supabase.auth.getSession() response:', { session, sessionError });

        if (sessionError) {
          console.error('[Callback] Session check error:', sessionError)
          console.log('[Callback] Redirecting to /auth/signin due to sessionError.');
          setError("Session invalid or expired. Please log in again.")
          setTimeout(() => {
            window.location.href = '/auth/signin?error=session_error'
          }, 2000)
          return
        }

        if (session) {
          console.log('[Callback] Session object analysis:', {
            isNull: session === null,
            isExpired: session?.expires_at ? (session.expires_at * 1000 < Date.now()) : 'N/A',
            isValid: session !== null && (session?.expires_at ? (session.expires_at * 1000 >= Date.now()) : true)
          });
          if (session !== null && (session?.expires_at ? (session.expires_at * 1000 >= Date.now()) : true)) {
            console.log('[Callback] Valid session found. Redirecting to /dashboard.');
            console.log('[Callback] Session user:', session.user?.email);
            window.location.href = '/dashboard'
          } else {
            console.log('[Callback] Session is null or expired. Proceeding to token/code check.');
          }
          return
        }

        // Handle hash-based tokens (Magic Links or implicit OAuth)
        const access_token = urlHash.get('access_token')
        const refresh_token = urlHash.get('refresh_token')

        if (access_token) {
          console.log('[Callback] Processing hash-based tokens...')
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          })
          console.log('[Callback] supabase.auth.setSession() response:', { data, error });
          
          if (error) {
            console.error('[Callback] Token session set error:', error)
            setError("Session invalid or expired. Please log in again.")
            setTimeout(() => {
              window.location.href = '/auth/signin?error=token_failed'
            }, 2000)
            return
          }

          if (data.session) {
            console.log('[Callback] Token authentication successful, redirecting to dashboard')
            console.log('[Callback] Session user:', data.session.user?.email)
            window.location.href = '/dashboard'
            return
          } else {
            console.log('[Callback] Token authentication failed or no session returned. Redirecting to /auth/signin.');
            setError("Session invalid or expired. Please log in again.");
            setTimeout(() => {
              window.location.href = '/auth/signin?error=token_failed_no_session';
            }, 2000);
            return;
          }
        }

        // Handle query-based code (fallback for PKCE if needed)
        const code = urlParams.get('code')

        if (code) {
          console.log('[Callback] Processing OAuth code...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          console.log('[Callback] supabase.auth.exchangeCodeForSession() response:', { data, error });
          
          if (error) {
            console.error('[Callback] OAuth code exchange error:', error)
            // If PKCE fails, redirect to try implicit flow
            console.log('[Callback] PKCE failed, redirecting to retry with implicit flow')
            setError("Session invalid or expired. Please log in again.")
            setTimeout(() => {
              window.location.href = '/auth/signin?error=oauth_retry'
            }, 2000)
            return
          }

          if (data.session) {
            console.log('[Callback] OAuth authentication successful, redirecting to dashboard')
            console.log('[Callback] Session user:', data.session.user?.email)
            window.location.href = '/dashboard'
            return
          } else {
            console.log('[Callback] OAuth authentication failed or no session returned. Redirecting to /auth/signin.');
            setError("Session invalid or expired. Please log in again.");
            setTimeout(() => {
              window.location.href = '/auth/signin?error=oauth_failed_no_session';
            }, 2000);
            return;
          }
        }

        // No session found, redirect to login
        console.log('[Callback] No session, token, or code processed. Redirecting to /auth/signin (no_session).')
        setTimeout(() => {
          window.location.href = '/auth/signin?error=no_session'
        }, 2000)

      } catch (error) {
        console.error('[Callback] Fatal error:', error)
        console.log('[Callback] Redirecting to /auth/signin due to fatal error.');
        setError("Session invalid or expired. Please log in again.")
        setTimeout(() => {
          window.location.href = '/auth/signin?error=callback_failed'
        }, 2000)
      }
    }

    // Only run if we're on the client and router is ready
    if (isClient && router.isReady) {
      // Add a small delay to ensure URL processing is complete
      setTimeout(handleAuthCallback, 100)
    }
  }, [isClient, router, router.isReady])

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#32CD32] mx-auto"></div>
        <p className="mt-4 text-lg text-white font-mono">
          {error ? 'Authentication failed...' : 'Processing authentication...'}
        </p>
        {error && (
          <p className="mt-2 text-red-400 text-sm">
            {error}
          </p>
        )}
        <p className="mt-2 text-gray-400 text-xs">
          Please wait while we complete your login...
        </p>
      </div>
    </div>
  )
} 