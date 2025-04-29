import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleLogin = async () => {
      try {
        const code = router.query.code

        if (typeof code !== 'string') {
          throw new Error('No code found in URL')
        }

        // Exchange code for session
        const { error: signInError } = await supabase.auth.exchangeCodeForSession(code)

        if (signInError) {
          throw signInError
        }

        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (session) {
          console.log('Session established')
          await router.push('/dashboard')
        } else {
          throw new Error('No session found')
        }
      } catch (err) {
        console.error('Login failed:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } finally {
        setLoading(false)
      }
    }

    if (router.isReady && router.query.code) {
      handleLogin()
    }
  }, [router, router.isReady])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="max-w-md w-full space-y-4 p-6">
          <div className="text-center border-2 border-red-500 rounded-lg p-6 bg-black/60">
            <p className="text-red-400 font-mono tracking-wider">Authentication failed</p>
            <p className="text-sm text-red-400 font-mono mt-2">{error}</p>
            <p className="text-sm text-gray-400 font-mono mt-4">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-4 p-6">
        <div className="text-center border-2 border-[#32CD32] rounded-lg p-6 bg-black/60">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-[#32CD32] rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-[#32CD32] rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-[#32CD32] rounded-full animate-bounce delay-200" />
          </div>
          <p className="text-[#32CD32] font-mono tracking-wider">
            {loading ? 'COMPLETING LOGIN...' : 'REDIRECTING...'}
          </p>
        </div>
      </div>
    </div>
  )
} 