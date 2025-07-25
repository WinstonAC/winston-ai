import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

export default function CreateTeam() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Demo mode: skip auth check, allow team creation access  
    // if (isClient && router.isReady && !authLoading && !user) {
    //   router.push('/auth/signin');
    // }
  }, [isClient, router, authLoading, user]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!isClient || !router.isReady) {
    return <div>Loading...</div>;
  }

  if (isClient && router.isReady && !authLoading && !user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent | undefined, type: string) => {
    e?.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/team/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create team');
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating team:', error);
      setError(error instanceof Error ? error.message : 'Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Head>
        <title>Create Team - Winston AI</title>
        <meta name="description" content="Create a new team" />
      </Head>

      <Navigation />

      <div className="min-h-screen flex flex-col py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-2xl font-mono text-white">
            GET_STARTED_
          </h1>
          <p className="mt-2 text-sm text-gray-200">
            Choose how you want to use Winston AI
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-900 bg-opacity-20 text-red-400 rounded-md text-sm border border-red-800">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="p-4 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
                <h2 className="text-lg font-mono text-white mb-2">PERSONAL_ACCOUNT_</h2>
                <p className="text-sm text-gray-200 mb-4">
                  Use Winston AI as an individual. Perfect for solo entrepreneurs and freelancers.
                </p>
                <button
                  onClick={() => handleSubmit(undefined, 'personal')}
                  disabled={isCreating}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isCreating ? 'Setting up...' : 'Start as Individual'}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-400 bg-gray-900">Or create a team</span>
                </div>
              </div>

              <form onSubmit={(e) => handleSubmit(e, 'team')} className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm text-gray-200 mb-1">
                    Team Name
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter team name..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Team Account'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 