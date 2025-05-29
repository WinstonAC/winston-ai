import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function Callback() {
  const router = useRouter()
  const [error, setError] = useState(false)

  useEffect(() => {
    const handleAuth = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const access_token = hashParams.get('access_token')
      const refresh_token = hashParams.get('refresh_token')
      const queryParams = new URLSearchParams(window.location.search)
      const code = queryParams.get('code')

      try {
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })
          if (error) throw error
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } else {
          throw new Error('No token or code found.')
        }

        router.push('/dashboard')
      } catch (err) {
        console.error('[Callback Error]', err)
        setError(true)
        setTimeout(() => router.push('/auth/signin'), 3000)
      }
    }

    handleAuth()
  }, [])

  return (
    <div className="text-white p-8 text-center">
      <h2 className="text-2xl font-semibold">
        {error ? 'Authentication failed. Redirecting...' : 'Logging you in...'}
      </h2>
      {!error && <p className="text-gray-400 mt-2">Please wait while we verify your session.</p>}
    </div>
  )
} 