import React from 'react';
import Head from 'next/head';
import Login from '@/components/Login';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - Winston AI</title>
        <meta name="description" content="Login to your Winston AI account" />
      </Head>
      <Login />
    </>
  );
}