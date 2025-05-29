import React, { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { showErrorToast, AppError } from '../lib/error';
import Image from 'next/image';
import { signInWithEmail, signInWithGoogle } from '../lib/supabase-auth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signInWithEmail(email.trim());
      setMagicLinkSent(true);
    } catch (err) {
      console.error('Email login error:', err);
      showErrorToast(new AppError('Failed to send magic link. Please try again.', 'authentication'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in error:', (err as Error).message);
      alert('Google login failed');
      showErrorToast(new AppError('Google login failed. Please try again.', 'authentication'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="brutalist-container flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/winston-logo.svg"
            alt="Winston AI Logo"
            width={40}
            height={40}
            priority
          />
        </div>

        {/* Header */}
        <h1 className="text-[32px] font-medium text-white text-center mb-2">
          Welcome to Winston AI
        </h1>
        <p className="text-[15px] text-gray-400 text-center mb-8">
          Sign in or create an account to get started
        </p>

        {/* Login Form */}
        <div className="w-full space-y-6">
          {/* Google Login */}
          <button onClick={handleGoogleLogin}>
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2B3548]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-[13px] text-gray-500 bg-[#171C28]">
                Or continue with email
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

            {magicLinkSent ? (
              <div className="text-center text-green-400 text-sm">
                We've sent a magic link to your email. Click it to sign in or create your account.
              </div>
            ) : (
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
                    <span>Sending magic link...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>Continue with Email</span>
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </div>
                )}
              </button>
            )}
          </form>

          {/* Terms */}
          <p className="text-[13px] text-gray-500 text-center">
            By continuing, you agree to our{' '}
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