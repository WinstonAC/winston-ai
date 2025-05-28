import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session after OAuth callback
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/signin?error=callback_error')
          return
        }

        if (session) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard')
        } else {
          // No session found, redirect to login
          router.push('/auth/signin?error=no_session')
        }
      } catch (error) {
        console.error('Callback handling error:', error)
        router.push('/auth/signin?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#32CD32] mx-auto"></div>
        <p className="mt-4 text-lg text-white font-mono">Processing authentication...</p>
      </div>
    </div>
  )
} 