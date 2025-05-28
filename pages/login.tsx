import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { registered } = router.query;
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      
      // Show success message or redirect
      alert('Check your email for the login link');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send login link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Google login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Navigation groups
  const mainNavigation = [
    {
      name: 'Company',
      items: [
        { name: 'Solutions', href: '/solutions' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Demo', href: '/demo' },
      ],
      auth: false,
    },
  ];

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Login - Winston AI</title>
        <meta name="description" content="Login to Winston AI" />
      </Head>

      <div className="min-h-screen bg-black">
        <Navigation />

        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="text-center text-3xl font-mono tracking-wider text-[#32CD32]">
                SIGN IN
              </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
              {registered && (
                <div className="mb-4 p-4 bg-[#32CD32]/10 text-[#32CD32] rounded-md text-sm border border-[#32CD32]/20 font-mono">
                  ACCOUNT CREATED SUCCESSFULLY
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-4 bg-red-900/20 text-red-400 rounded-md text-sm border border-red-800 font-mono">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-mono text-gray-400 mb-2">
                  EMAIL ADDRESS
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent"
                  placeholder="ENTER EMAIL"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-mono text-gray-400 mb-2">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#32CD32] focus:border-transparent pr-12"
                    placeholder="ENTER PASSWORD"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-mono tracking-wider text-white bg-[#32CD32] hover:bg-[#32CD32]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32CD32] disabled:opacity-50"
                >
                  {isLoading ? 'SENDING LOGIN LINK' : 'SIGN IN'}
                </button>
              </div>

              <div className="text-center text-sm">
                <Link href="/register" className="font-mono tracking-wider text-[#32CD32] hover:text-[#32CD32]/90">
                  NO ACCOUNT SIGN UP
                </Link>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link
                  href="/solutions"
                  className="inline-flex items-center justify-center px-8 py-4 border border-2 border-[#32CD32] text-base font-medium rounded-md text-[#32CD32] hover:bg-[#32CD32]/10 transition-colors opacity-0 animate-slide-up"
                  style={{ animationDelay: '2s' }}
                >
                  Learn More
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}