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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-mono text-9xl font-bold text-black">404_</h1>
          <p className="mt-4 text-xl text-gray-600">Page not found</p>
          <p className="mt-2 text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
          
          <div className="mt-8">
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 