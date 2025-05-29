import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function Callback() {
  const router = useRouter()
  const [error, setError] = useState(false)

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) {
          console.error('Error setting session:', error)
          setError(true)
        } else {
          router.push('/dashboard')
        }
        return
      }

      // Handle PKCE flow (Google OAuth style) with ?code param
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Error exchanging code:', error)
          setError(true)
        } else {
          router.push('/dashboard')
        }
        return
      }

      setError(true)
    }

    handleAuth()
  }, [])

  return (
    <div className="text-white p-8 text-center">
      <h2>{error ? 'Authentication failed' : 'Logging you in...'}</h2>
    </div>
  )
} 