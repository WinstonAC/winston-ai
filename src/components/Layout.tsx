import React from 'react';
import { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white font-mono text-black">
      <Navigation />
      <main className="max-w-screen-lg mx-auto px-6 sm:px-8 md:px-12 py-10 mt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
} 