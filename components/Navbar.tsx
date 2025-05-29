import React from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { supabase } from '@/lib/supabase';
// import type { User } from '@supabase/supabase-js';

const Navbar: React.FC = () => {
  // const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#111111] border-b border-[#222222] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-[#32CD32] font-mono tracking-widest hover:underline">
              WINSTON_AI_
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="font-mono tracking-widest text-white hover:underline"
            >
              SIGN_IN_
            </Link>
            <Link 
              href="/demo" 
              className="font-mono tracking-widest text-[#32CD32] hover:underline"
            >
              REQUEST_DEMO_
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 