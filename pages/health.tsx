import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';

export default function Health() {
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const { count, error } = await supabase
          .from('leads')
          .select('*', { count: 'exact' });
        
        if (error) throw error;
        setLeadCount(count);
      } catch (err) {
        console.error('Health check error:', err);
        setError(err instanceof Error ? err.message : 'Failed to check health');
      }
    }

    checkHealth();
  }, []);

  return (
    <>
      <Head>
        <title>Health Check | Winston AI</title>
      </Head>

      <div className="min-h-screen bg-brutalist-gray text-black font-mono">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="border-thicc border-black bg-white p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">
              ✅ Winston AI is alive
            </h1>
            
            {error ? (
              <p className="text-red-600">Error: {error}</p>
            ) : leadCount === null ? (
              <p>Loading...</p>
            ) : (
              <p>Total leads in database: {leadCount}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 