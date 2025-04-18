import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
// import { supabase } from '@/lib/supabase';
// import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<any>(null); // Temporarily using any type
  const router = useRouter();

  useEffect(() => {
    // Mock user data for UI development
    setUser({
      email: 'user@example.com',
      id: 'mock-user-id'
    });
  }, []);

  const handleSignOut = async () => {
    // Mock sign out for UI development
    setUser(null);
  };

  return (
    <nav className="w-full border-b-2 border-black py-4 px-6 flex items-center justify-between font-mono bg-white">
      {/* Logo */}
      <div className="text-lg font-bold">
        <Link href="/">Winston AI</Link>
      </div>

      {/* Navigation Links */}
      <div className="flex gap-6 text-sm items-center">
        <Link 
          href="/" 
          className={router.pathname === '/' ? 'font-bold' : ''}
        >
          Home
        </Link>
        
        <Link 
          href="/dashboard" 
          className={router.pathname === '/dashboard' ? 'font-bold' : ''}
        >
          Dashboard
        </Link>
        
        <Link 
          href="/demo" 
          className={router.pathname === '/demo' ? 'font-bold' : ''}
        >
          Demo
        </Link>
        
        <Link 
          href="/pricing" 
          className={router.pathname === '/pricing' ? 'font-bold' : ''}
        >
          Pricing
        </Link>
        
        <Link 
          href="/upload" 
          className={router.pathname === '/upload' ? 'font-bold' : ''}
        >
          Upload
        </Link>
        {user ? (
          <button
            onClick={handleSignOut}
            className="border-2 border-black px-4 py-1 hover:bg-gray-100"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="border-2 border-black px-4 py-1 hover:bg-gray-100"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
} 