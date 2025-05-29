import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function Callback() {
  const router = useRouter()
  const [error, setError] = useState(false)

  useEffect(() => {
    const login = async () => {
      const url = new URL(window.location.href)
      const hash = url.hash.substring(1)
      const params = new URLSearchParams(hash)

      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      const code = url.searchParams.get('code')

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } else if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error
        } else {
          throw new Error('No token found')
        }

        router.push('/dashboard')
      } catch (err) {
        console.error('Auth error:', err)
        setError(true)
        router.push('/auth/signin')
      }
    }

    login()
  }, [])

  return (
    <div className="text-white p-8 text-center">
      <h2>{error ? 'Authentication failed' : 'Logging you in...'}</h2>
    </div>
  )
} 