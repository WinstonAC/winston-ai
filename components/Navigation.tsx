import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { Cog6ToothIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const adminButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Handle clicks outside of menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check admin menu
      if (
        adminMenuRef.current &&
        adminButtonRef.current &&
        !adminMenuRef.current.contains(event.target as Node) &&
        !adminButtonRef.current.contains(event.target as Node)
      ) {
        setShowAdminMenu(false);
      }

      // Check navigation dropdowns
      if (activeDropdown) {
        const activeRef = dropdownRefs.current[activeDropdown];
        if (activeRef && !activeRef.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Navigation groups
  const mainNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      auth: true,
    },
    {
      name: 'Marketing',
      items: [
        { name: 'Campaigns', href: '/campaigns' },
        { name: 'Leads', href: '/leads' },
      ],
      auth: true,
    },
    {
      name: 'Company',
      items: [
        { name: 'Solutions', href: '/solutions' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Demo', href: '/demo' },
      ],
      auth: false,
    },
  ];

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center font-mono text-white">
              WINSTON_AI_
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-8">
              {mainNavigation.map((item) => {
                if (!item.auth || (item.auth && session)) {
                  if (item.items) {
                    return (
                      <div 
                        key={item.name} 
                        className="relative"
                        ref={(el) => dropdownRefs.current[item.name] = el}
                      >
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className="flex items-center text-sm text-gray-200 hover:text-white"
                        >
                          {item.name}
                          <ChevronDownIcon className={`ml-1 h-4 w-4 transform transition-transform ${
                            activeDropdown === item.name ? 'rotate-180' : ''
                          }`} />
                        </button>
                        {activeDropdown === item.name && (
                          <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1">
                            {item.items.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`block px-4 py-2 text-sm ${
                                  router.pathname === subItem.href
                                    ? 'text-white font-medium bg-gray-700'
                                    : 'text-gray-200 hover:bg-gray-700'
                                }`}
                                onClick={() => setActiveDropdown(null)}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`text-sm ${
                          router.pathname === item.href
                            ? 'text-white font-medium'
                            : 'text-gray-200 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  }
                }
                return null;
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                {/* Admin Gear Button */}
                <div className="relative">
                  <button
                    ref={adminButtonRef}
                    onClick={() => setShowAdminMenu(!showAdminMenu)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors group"
                    aria-label="Admin settings"
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-gray-200 group-hover:text-white transition-colors" />
                  </button>

                  {/* Admin Dropdown Menu */}
                  {showAdminMenu && (
                    <div
                      ref={adminMenuRef}
                      className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50"
                    >
                      <Link
                        href="/team"
                        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setShowAdminMenu(false)}
                      >
                        Team Management
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={() => setShowAdminMenu(false)}
                      >
                        Account Settings
                      </Link>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-200 hover:text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-200 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Request demo
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 