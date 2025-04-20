import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Winston AI</title>
      </Head>
      <main className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <h1 className="font-mono text-9xl font-bold text-black">404</h1>
          <p className="text-xl text-gray-400 mt-4">Page not found</p>
          <Link href="/" className="mt-8 inline-block text-[#32CD32] hover:text-[#2db82d]">
            Return Home
          </Link>
        </div>
      </main>
    </>
  );
} 