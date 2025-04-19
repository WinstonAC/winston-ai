import React from 'react';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from 'next/head';
import Layout from '@/components/Layout';
import Chatbot from '../components/Chatbot';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <link rel="icon" href="/assets/winston-favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout>
        <Component {...pageProps} />
        <Chatbot />
      </Layout>
    </SessionProvider>
  );
}
