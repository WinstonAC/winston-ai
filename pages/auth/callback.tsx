import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Parse both URL query parameters and hash fragments
        const urlParams = new URLSearchParams(window.location.search)
        const urlHash = new URLSearchParams(window.location.hash.substring(1))
        
        const error_code = urlParams.get('error') || urlHash.get('error')
        const error_description = urlParams.get('error_description') || urlHash.get('error_description')

        // Handle error from auth provider
        if (error_code) {
          console.error('Auth provider error:', error_description || error_code)
          setError(error_description || error_code)
          setTimeout(() => {
            router.push('/auth/signin?error=auth_provider_error')
          }, 2000)
          return
        }

        // Handle hash-based tokens (Magic Links)
        const access_token = urlHash.get('access_token')
        const refresh_token = urlHash.get('refresh_token')

        if (access_token && refresh_token) {
          console.log('Processing hash-based magic link tokens...')
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })
          
          if (error) {
            console.error('Magic link session set error:', error)
            setError(error.message)
            setTimeout(() => {
              router.push('/auth/signin?error=magic_link_failed')
            }, 2000)
            return
          }

          if (data.session) {
            console.log('Magic link authentication successful, redirecting to dashboard')
            console.log("Session:", data.session)
            window.location.href = '/dashboard'
            return
          }
        }

        // Handle query-based code (OAuth PKCE flow)
        const code = urlParams.get('code')

        if (code) {
          console.log('Processing OAuth PKCE code...')
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('OAuth code exchange error:', error)
            setError(error.message)
            setTimeout(() => {
              router.push('/auth/signin?error=oauth_failed')
            }, 2000)
            return
          }

          if (data.session) {
            console.log('OAuth authentication successful, redirecting to dashboard')
            console.log("Session:", data.session)
            window.location.href = '/dashboard'
            return
          }
        }

        // Fallback: check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session check error:', sessionError)
          setError(sessionError.message)
          setTimeout(() => {
            router.push('/auth/signin?error=session_error')
          }, 2000)
          return
        }

        if (session) {
          console.log('Existing session found, redirecting to dashboard')
          console.log("Session:", session)
          window.location.href = '/dashboard'
        } else {
          // No session found, redirect to login
          console.log('No session found, redirecting to signin')
          setTimeout(() => {
            router.push('/auth/signin?error=no_session')
          }, 2000)
        }
      } catch (error) {
        console.error('Callback handling error:', error)
        setError(error instanceof Error ? error.message : 'Authentication failed')
        setTimeout(() => {
          router.push('/auth/signin?error=callback_failed')
        }, 2000)
      }
    }

    // Only run if we're in the browser and router is ready
    if (typeof window !== 'undefined' && router.isReady) {
      // Add a small delay to ensure URL processing is complete
      setTimeout(handleAuthCallback, 100)
    }
  }, [router, router.isReady])

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