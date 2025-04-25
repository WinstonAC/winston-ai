import React from 'react';
import Head from 'next/head';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Winston AI</title>
        <meta name="description" content="Winston AI - Your AI Assistant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-white font-mono text-black">
        <Navigation />
        <main className="max-w-screen-lg mx-auto px-6 sm:px-8 md:px-12 py-10 mt-16">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout; 