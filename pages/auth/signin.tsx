import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Chatbot from '@/components/Chatbot'

export default function LoginPage() {
  const router = useRouter()
  const [message, setMessage] = useState<string>('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication System Maintenance
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We are currently updating our authentication system. Please check back later.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-gray-600">
                The login system is temporarily disabled while we update our Supabase configuration.
                Please contact support if you need immediate access.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  )
} 