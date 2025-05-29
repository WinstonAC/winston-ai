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
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabase';

export default function App({ 
  Component, 
  pageProps
}: AppProps) {
  const [isAuthPage, setIsAuthPage] = useState(false);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && router.isReady) {
      setIsAuthPage(['/auth/signin', '/auth/callback'].includes(router.pathname));
    }
  }, [isClient, router.isReady, router.pathname]);

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

  // Render null on the server or if the router is not ready on the client
  if (!isClient || !router.isReady) {
    // Check for typeof window !== 'undefined' to ensure this only happens client-side if router is not ready
    // On server, isClient is false, so this will be true.
    if (typeof window !== 'undefined') {
        return null;
    }
    // If on server (isClient is false), we might render a placeholder or nothing, 
    // depending on desired SSR behavior. For now, consistent with previous null.
    return null; 
  }

  return (
    <SessionContextProvider 
      supabaseClient={supabase}
      initialSession={pageProps.initialSession || null}
    >
      <AuthProvider>
        <Head>
          <title>Winston AI</title>
          <meta name="description" content="AI-powered lead generation and outreach platform" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ErrorBoundary>
          {isAuthPage ? (
            <Component {...pageProps} />
          ) : (
            <Layout>
              <Component {...pageProps} />
              <Chatbot />
            </Layout>
          )}
          <Toast />
        </ErrorBoundary>
      </AuthProvider>
    </SessionContextProvider>
  );
}
