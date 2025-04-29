import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback'
        }
      })

      if (error) {
        throw error
      }

      setMessage('Magic link sent! Check your email.')
    } catch (err) {
      console.error('Email login error:', err)
      setMessage(err instanceof Error ? err.message : 'Failed to send magic link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <h1 className="text-[#32CD32] text-4xl text-center font-mono mb-2">
          Sign in to your account
        </h1>
        <p className="text-gray-500 text-center font-mono mb-8">
          We'll send you a magic link to sign in
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full bg-white/5 border-2 border-[#32CD32] rounded-md p-4
                     text-white font-mono placeholder-gray-500
                     focus:outline-none focus:ring-0"
            disabled={isLoading}
          />

          {message && (
            <div className={`p-4 rounded-md font-mono text-center ${
              message.includes('Failed') || message.includes('error')
                ? 'text-red-400 border-2 border-red-500'
                : 'text-[#32CD32] border-2 border-[#32CD32]'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#32CD32] text-black font-mono p-4 rounded-md
                     hover:bg-[#32CD32]/90 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send magic link
          </button>
        </form>
      </div>
    </div>
  )
} 