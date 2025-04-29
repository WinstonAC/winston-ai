import React from 'react';
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from 'next/head';
import Layout from '../components/Layout';
import Chatbot from '../components/Chatbot';
import { useRouter } from 'next/router';
import { Toast } from '../components/Toast';
import ErrorBoundary from '../components/ErrorBoundary';
import { AuthProvider } from '../contexts/AuthContext';

export default function App({ 
  Component, 
  pageProps
}: AppProps) {
  const router = useRouter();
  const isAuthPage = ['/auth/signin', '/auth/callback'].includes(router.pathname);

  return (
    <AuthProvider>
      <>
        <Head>
          <link rel="icon" href="/assets/winston-favicon.ico" sizes="32x32" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        {!isAuthPage ? (
          <Layout>
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
          </Layout>
        ) : (
          <Component {...pageProps} />
        )}
        <Chatbot initialContext={router.pathname.includes('analytics') ? 'analytics' : 'general'} />
        <Toast position="top-right" />
      </>
    </AuthProvider>
  );
}
