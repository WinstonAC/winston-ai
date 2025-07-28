import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  role?: string;
  created_at: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
}

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real users from Supabase
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        setError('Unable to fetch users. This may require admin privileges.');
        return;
      }

      if (usersData && usersData.length > 0) {
        setUsers(usersData);
      } else {
        // Fallback demo data if no users found
        const mockUsers = [
          {
            id: 'demo-user-123',
            email: 'demo@winston-ai.com',
            role: 'admin',
            created_at: new Date().toISOString(),
            user_metadata: {
              full_name: 'Demo User',
              role: 'admin'
            }
          },
          {
            id: 'admin-user-456', 
            email: 'admin@winston-ai.com',
            role: 'admin',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            user_metadata: {
              full_name: 'Winston AI Admin',
              role: 'admin'
            }
          },
          {
            id: 'user-789',
            email: 'user@example.com',
            role: 'member',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            user_metadata: {
              full_name: 'Sample User',
              role: 'member'
            }
          }
        ];
        setUsers(mockUsers);
        setError('Note: Showing demo data. Connect to live Supabase for real users.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while fetching users.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserRole = (user: User) => {
    return user.user_metadata?.role || user.role || 'member';
  };

  const getUserName = (user: User) => {
    return user.user_metadata?.full_name || user.email.split('@')[0];
  };

  return (
    <>
      <Head>
        <title>Admin Panel - Winston AI</title>
        <meta name="description" content="Admin panel for user management" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-mono text-[#32CD32] mb-2">Admin Panel</h1>
            <p className="text-gray-400 font-mono">User management and system overview</p>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black border-2 border-[#32CD32] p-6 text-center">
              <h3 className="font-mono text-lg text-[#32CD32] mb-2">Total Users</h3>
              <p className="text-3xl font-mono text-white">{users.length}</p>
            </div>
            <div className="bg-black border-2 border-[#32CD32] p-6 text-center">
              <h3 className="font-mono text-lg text-[#32CD32] mb-2">Admins</h3>
              <p className="text-3xl font-mono text-white">
                {users.filter(u => getUserRole(u) === 'admin').length}
              </p>
            </div>
            <div className="bg-black border-2 border-[#32CD32] p-6 text-center">
              <h3 className="font-mono text-lg text-[#32CD32] mb-2">Active Users</h3>
              <p className="text-3xl font-mono text-white">{users.length}</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-black border-2 border-[#32CD32] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#32CD32]">
              <h2 className="text-xl font-mono text-[#32CD32]">System Users</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <span className="text-[#32CD32] font-mono">Loading users...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <span className="text-red-400 font-mono">{error}</span>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-gray-400 font-mono">No users found</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#32CD32]">
                      <th className="px-6 py-4 text-left font-mono text-[#32CD32]">User</th>
                      <th className="px-6 py-4 text-left font-mono text-[#32CD32]">Email</th>
                      <th className="px-6 py-4 text-left font-mono text-[#32CD32]">Role</th>
                      <th className="px-6 py-4 text-left font-mono text-[#32CD32]">Created At</th>
                      <th className="px-6 py-4 text-left font-mono text-[#32CD32]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userData) => (
                      <tr key={userData.id} className="border-b border-gray-800 hover:bg-gray-900">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-[#32CD32] flex items-center justify-center mr-3">
                              <span className="text-sm font-mono text-black">
                                {getUserName(userData)[0].toUpperCase()}
                              </span>
                            </div>
                            <span className="font-mono text-white">
                              {getUserName(userData)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-300">{userData.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded font-mono text-xs ${
                            getUserRole(userData) === 'admin' 
                              ? 'bg-[#32CD32] text-black' 
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {getUserRole(userData).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-300">
                          {formatDate(userData.created_at)}
                        </td>
                                                 <td className="px-6 py-4">
                           <button 
                             onClick={() => alert(`Edit user: ${userData.email}`)}
                             className="text-[#32CD32] hover:text-green-400 font-mono text-sm mr-2"
                           >
                             Edit
                           </button>
                           <button 
                             onClick={() => alert(`Delete user: ${userData.email}`)}
                             className="text-red-400 hover:text-red-300 font-mono text-sm"
                           >
                             Delete
                           </button>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black border-2 border-[#32CD32] p-6">
              <h3 className="font-mono text-lg text-[#32CD32] mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Database</span>
                  <span className="text-[#32CD32] font-mono">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Auth Service</span>
                  <span className="text-[#32CD32] font-mono">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-mono">Email Service</span>
                  <span className="text-yellow-400 font-mono">Configured</span>
                </div>
              </div>
            </div>

            <div className="bg-black border-2 border-[#32CD32] p-6">
              <h3 className="font-mono text-lg text-[#32CD32] mb-4">Quick Actions</h3>
                             <div className="space-y-3">
                 <button 
                   onClick={() => alert('System logs would appear here in a real admin panel')}
                   className="w-full bg-black border border-[#32CD32] text-[#32CD32] py-2 px-4 font-mono hover:bg-[#32CD32] hover:text-black transition-colors"
                 >
                   View System Logs
                 </button>
                 <button 
                   onClick={() => alert('User data export functionality would be implemented here')}
                   className="w-full bg-black border border-[#32CD32] text-[#32CD32] py-2 px-4 font-mono hover:bg-[#32CD32] hover:text-black transition-colors"
                 >
                   Export User Data
                 </button>
                 <button 
                   onClick={() => alert('System settings panel would open here')}
                   className="w-full bg-black border border-[#32CD32] text-[#32CD32] py-2 px-4 font-mono hover:bg-[#32CD32] hover:text-black transition-colors"
                 >
                   System Settings
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 