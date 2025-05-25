import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page
    router.push('/')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">Redirecting...</p>
    </div>
  )
} 