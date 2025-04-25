import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { showErrorToast } from '../lib/error';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/sandbox'
      });

      if (result?.url) {
        router.push(result.url);
      } else {
        showErrorToast({ message: 'Login failed. Please try again.' });
      }
    } catch (err) {
      showErrorToast({ message: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn('google', { callbackUrl: '/sandbox' });
    } catch (err) {
      showErrorToast({ message: 'Google login failed. Please try again.' });
    }
  };

  return (
    <div className="brutalist-container flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/assets/winston-logo.svg"
            alt="Winston AI Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </div>

        {/* Header */}
        <h1 className="text-[32px] font-medium text-white text-center mb-2">
          Welcome back
        </h1>
        <p className="text-[15px] text-gray-400 text-center mb-8">
          Sign in to your Winston AI account
        </p>

        {/* Login Form */}
        <div className="w-full space-y-6">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-50 text-[15px] text-gray-900 px-4 py-3 flex items-center justify-center space-x-3 transition-colors"
          >
            <img
              src="/assets/google-logo.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2B3548]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-[13px] text-gray-500 bg-[#171C28]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] text-gray-400 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="brutalist-input text-[15px]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="brutalist-button text-[15px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Continue with Email</span>
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </div>
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-[13px] text-gray-500 text-center">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-[#2B63F3] hover:text-[#1E4CD8]">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-[#2B63F3] hover:text-[#1E4CD8]">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 