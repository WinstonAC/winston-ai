import React from 'react';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from 'next/head';
import Layout from '@/components/Layout';
import UserFlowAssistant from '@/components/UserFlowAssistant';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/router';

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(router.pathname);

  return (
    <>
      <Head>
        <link rel="icon" href="/assets/winston-favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {!isAuthPage ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
      <UserFlowAssistant />
    </>
  );
}

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <AppContent Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}
