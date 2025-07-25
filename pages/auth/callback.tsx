import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

/**
 * Auth Callback Page
 * 
 * This page handles the redirect after a user clicks a magic link.
 * It attempts to get the session from the URL and:
 * - On success: Redirects to the dashboard
 * - On failure: Redirects back to login with an error
 */
export default function AuthCallback() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL (handles magic links)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error.message)
          router.replace('/auth/signin?error=magic_link_failed')
          return
        }

        if (session) {
          // Successful authentication, redirect to dashboard
          router.replace('/dashboard')
        } else {
          // No session found, redirect to login
          router.replace('/auth/signin?error=no_session')
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err)
        router.replace('/auth/signin?error=magic_link_failed')
      } finally {
        setIsLoading(false)
      }
    }

    handleAuthCallback()
  }, [router])

  // Show loading state while processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h2 className="text-xl font-mono text-[#32CD32] mb-4">Processing login...</h2>
        <p className="text-gray-400">Please wait while we complete your authentication.</p>
      </div>
    </div>
  )
} 