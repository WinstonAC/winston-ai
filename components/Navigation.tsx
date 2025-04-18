import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Navigation: React.FC = () => {
  const router = useRouter();
  
  const handleLogout = () => {
    // TODO: Implement actual logout logic
    router.push('/');
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-light text-white hover:text-gray-300 transition-colors">
              Winston AI
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link 
                href="/dashboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive('/dashboard') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/leads" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive('/leads') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                Leads
              </Link>
              <Link 
                href="/campaigns" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive('/campaigns') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                Campaigns
              </Link>
              <Link 
                href="/solutions" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive('/solutions') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                Solutions
              </Link>
              <Link 
                href="/pricing" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive('/pricing') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                Pricing
              </Link>
            </div>
          </div>
          {router.pathname !== '/login' && (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 