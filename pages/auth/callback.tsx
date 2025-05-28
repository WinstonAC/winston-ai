import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle OAuth callback - Supabase automatically processes the URL fragments
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          // Redirect with error after a delay
          setTimeout(() => {
            router.push('/auth/signin?error=callback_error')
          }, 2000)
          return
        }

        if (session) {
          console.log('OAuth success, redirecting to dashboard')
          // User is authenticated, redirect to dashboard
          router.push('/dashboard')
        } else {
          // No session found, redirect to login
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

    // Only run if we're in the browser
    if (typeof window !== 'undefined') {
      // Add a small delay to ensure URL processing is complete
      setTimeout(handleAuthCallback, 100)
    }
  }, [router])

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
      </div>
    </div>
  )
} 