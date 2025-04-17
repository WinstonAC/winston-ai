import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-brutalist-gray font-mono text-black">
      <Navbar />
      <main className="max-w-screen-lg mx-auto px-6 sm:px-8 md:px-12 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
} 