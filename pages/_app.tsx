import React, { useState, useEffect } from 'react';
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from 'next/head';
import Layout from '../components/Layout';
import Chatbot from '../components/Chatbot';
import { useRouter } from 'next/router';
import { Toast } from '../components/Toast';
import ErrorBoundary from '../components/ErrorBoundary';
import { AuthProvider } from '../contexts/AuthContext';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase';

export default function App({ 
  Component, 
  pageProps
}: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());
  const router = useRouter();
  const isAuthPage = ['/auth/signin', '/auth/callback'].includes(router.pathname);

  // Debug session token in development using unified client
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      supabase.auth.getSession().then(({ data }) => {
        console.log("[DEBUG] Supabase session:", data?.session?.access_token);
        console.log("[DEBUG] Session user:", data?.session?.user?.email);
        console.log("[DEBUG] Session expires at:", data?.session?.expires_at);
        console.log("Session:", data?.session);
      });
    }
  }, []);

  return (
    <SessionContextProvider 
      supabaseClient={supabaseClient} 
      initialSession={pageProps.initialSession || null}
    >
      <AuthProvider>
        <Head>
          <link rel="icon" href="/assets/winston-favicon.ico" sizes="32x32" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        
        {!isAuthPage ? (
          <Layout>
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
            <Chatbot initialContext={router.pathname.includes('analytics') ? 'analytics' : 'general'} />
          </Layout>
        ) : (
          <Component {...pageProps} />
        )}
        
        <Toast position="top-right" />
      </AuthProvider>
    </SessionContextProvider>
  );
}
