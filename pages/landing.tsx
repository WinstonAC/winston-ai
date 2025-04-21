import Head from 'next/head';
import NewLandingPage from '@/components/NewLandingPage';

export default function Landing() {
  return (
    <>
      <Head>
        <title>Winston AI - Your AI Work Assistant</title>
        <meta name="description" content="Winston is the AI agent that does the work you dread. Cold emails, replies, and demo booking — handled." />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
      </Head>
      <NewLandingPage />
    </>
  );
} 