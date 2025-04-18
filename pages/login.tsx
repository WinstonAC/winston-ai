import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual authentication here
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="min-h-screen bg-black text-white font-mono">
        <Head>
          <title>Login - Winston AI</title>
          <meta name="description" content="Login to Winston AI" />
        </Head>

        <Navigation />

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-gray-900 to-black"></div>

        {/* Main content */}
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md relative z-10">
            {/* System Status Card */}
            <div className="bg-white/10 p-6 mb-8 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <span className="tracking-wider">SYSTEM_STATUS</span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-[#32CD32] rounded-full mr-2 animate-pulse"></span>
                  ONLINE
                </span>
              </div>
            </div>

            {/* Login Form Card */}
            <div className="bg-white/10 p-8 backdrop-blur-lg">
              <div className="text-2xl tracking-wider mb-8">INITIALIZE_SESSION_</div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm tracking-wider mb-2">
                    EMAIL_ADDRESS
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white text-black font-mono
                             focus:outline-none placeholder-gray-500 tracking-wider"
                    placeholder="ENTER_EMAIL"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm tracking-wider mb-2">
                    PASSWORD
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white text-black font-mono
                             focus:outline-none placeholder-gray-500 tracking-wider"
                    placeholder="ENTER_PASSWORD"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 bg-white text-black font-mono tracking-wider
                           transition-colors text-lg
                           ${loading ? 'bg-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span>AUTHENTICATING</span>
                      <span className="animate-pulse">...</span>
                    </span>
                  ) : (
                    'LOGIN_TO_SYSTEM'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <Link
                  href="/solutions"
                  className="block text-center text-gray-400 hover:text-white transition-colors tracking-wider"
                >
                  VIEW_SYSTEM_FEATURES →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#222222] z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-sm font-mono tracking-widest" style={{ color: 'rgb(50, 205, 50)' }}>
              POWERED_BY_CYLON_DIGITAL
            </p>
          </div>
        </div>

        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');

          * {
            font-family: 'IBM Plex Mono', monospace;
          }

          .bg-gradient-radial {
            background: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
          }
        `}</style>
      </div>
    </div>
  );
}