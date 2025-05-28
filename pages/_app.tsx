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
