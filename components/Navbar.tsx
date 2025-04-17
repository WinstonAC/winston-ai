import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="w-full border-b-2 border-black py-4 px-6 flex items-center justify-between font-mono bg-white">
      {/* Logo */}
      <div className="text-lg font-bold">
        <Link href="/">Winston AI</Link>
      </div>

      {/* Navigation Links */}
      <div className="flex gap-6 text-sm">
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
      </div>
    </nav>
  );
} 