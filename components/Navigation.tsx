import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [currentPathname, setCurrentPathname] = useState('');
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && router.isReady) {
      setCurrentPathname(router.pathname);
    }
  }, [isClient, router.isReady, router.pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const isActive = (path: string) => {
    return currentPathname === path;
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/contacts', label: 'Contacts' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-mono tracking-wider text-[#32CD32]">
                WINSTON AI
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${
                      isActive(link.href)
                        ? 'border-[#32CD32] text-white'
                        : 'border-transparent text-gray-400 hover:border-gray-700 hover:text-gray-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-mono tracking-wider`}
                  >
                    {link.label.toUpperCase()}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#32CD32]"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setShowAdminMenu(!showAdminMenu)}
                    className="max-w-xs bg-gray-800 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32CD32]"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                  </button>
                </div>
                {showAdminMenu && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 font-mono tracking-wider"
                      role="menuitem"
                    >
                      SIGN OUT
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-8 inline-flex items-center justify-center px-4 py-2 border border-[#32CD32] rounded-md text-sm font-mono tracking-wider text-[#32CD32] hover:bg-[#32CD32]/10"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  isActive(link.href)
                    ? 'bg-gray-800 border-[#32CD32] text-white'
                    : 'border-transparent text-gray-400 hover:bg-gray-800 hover:border-gray-700 hover:text-gray-300'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-mono tracking-wider`}
              >
                {link.label.toUpperCase()}
              </Link>
            ))}
          </div>
          {user && (
            <div className="pt-4 pb-3 border-t border-gray-800">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.email?.[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-base font-mono tracking-wider text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  SIGN OUT
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
} 