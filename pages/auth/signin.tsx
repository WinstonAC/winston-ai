import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Chatbot from '@/components/Chatbot'
import Image from 'next/image'

// Debug logging for Supabase client initialization
console.log("[ENV] Supabase URL", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("[ENV] Anon Key", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 6), "...")

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error

      // Show success message
      setMessage('Check your email for the login link')
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send login link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    console.log("[OAuth] about to sign in with Google")

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error("[OAuth] signInWithOAuth failed", error.message)
        throw error
      }
    } catch (err) {
      console.error("[OAuth] Fatal crash", err)
      setError(err instanceof Error ? err.message : 'Failed to login with Google')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-8">
            <Image
              src="/assets/winston-logo.svg"
              alt="Winston AI Logo"
              width={40}
              height={40}
              priority
              className="w-10 h-10"
            />
          </div>
          <h2 className="text-center text-3xl font-mono tracking-wider text-[#32CD32]">
            SIGN IN
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
              <p className="text-green-400 text-sm">{message}</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-[15px] text-gray-900 px-4 py-3 flex items-center justify-center space-x-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image
              src="/assets/google-logo.svg"
              alt="Google"
              width={20}
              height={20}
              priority
              className="w-5 h-5"
            />
            <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2B3548]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-[13px] text-gray-500 bg-black">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-[#2B3548] bg-black text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-[#32CD32] hover:bg-[#32CD32]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32CD32] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending link...' : 'Send magic link'}
            </button>
          </form>
        </div>
      </div>
      <Chatbot />
    </div>
  )
} 