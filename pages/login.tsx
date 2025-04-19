import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { signIn, useSession } from 'next-auth/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registered } = router.query;

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Head>
        <title>Login - Winston AI</title>
        <meta name="description" content="Login to Winston AI" />
      </Head>

      <div className="min-h-screen bg-black">
        <Navigation />

        <div className="min-h-screen flex flex-col py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h1 className="text-2xl font-semibold text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              {registered && (
                <div className="mb-4 p-4 bg-green-900 bg-opacity-20 text-green-400 rounded-md text-sm border border-green-800">
                  Account created successfully! Please sign in.
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-4 bg-red-900 bg-opacity-20 text-red-400 rounded-md text-sm border border-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Type your email..."
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Type your password..."
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-2 text-gray-400 hover:text-gray-300"
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
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>

                <div className="text-center text-sm">
                  <Link href="/signup" className="text-green-400 hover:text-green-300">
                    Don't have an account? Sign up
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}