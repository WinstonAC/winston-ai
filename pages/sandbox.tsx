import React, { Suspense, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Loader from '@/components/Loader';
import AgentLog from '@/components/AgentLog';
import { LogEntry, AgentState } from '@/types/agent';

const SandboxHeader = dynamic(() => import('@/components/SandboxHeader'), {
  loading: () => <div className="h-16 bg-gray-800 animate-pulse" />,
});

const SandboxSettings = dynamic(() => import('@/components/SandboxSettings'), {
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />,
});

export default function Sandbox() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agentState, setAgentState] = useState<AgentState>({
    isProcessing: false,
    currentTask: undefined,
    progress: 0,
  });

  const addLog = (message: string, type: LogEntry['type'] = 'info', details?: Record<string, any>) => {
    setLogs(prev => [
      ...prev,
      {
        message,
        type,
        timestamp: new Date().toLocaleTimeString(),
        details
      }
    ]);
  };

  const handleTestAgent = async () => {
    if (agentState.isProcessing) return;

    setAgentState(prev => ({ ...prev, isProcessing: true, currentTask: 'Testing agent...' }));
    addLog('Starting agent test...', 'info');

    try {
      // Simulate some agent tasks
      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog('Reading configuration...', 'info');

      await new Promise(resolve => setTimeout(resolve, 1500));
      addLog('Connecting to OpenAI API...', 'success');

      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog('Testing email templates...', 'info');

      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog('All systems operational!', 'success');
    } catch (error) {
      addLog('Error during agent test: ' + (error as Error).message, 'error');
    } finally {
      setAgentState(prev => ({ ...prev, isProcessing: false, currentTask: undefined }));
    }
  };

  if (status === 'loading') {
    return <Loader />;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Head>
        <title>Sandbox - Winston AI</title>
        <meta name="description" content="Test and experiment with Winston AI features in a safe environment" />
      </Head>
      
      <div className="min-h-screen bg-gray-900">
        <Suspense fallback={<div className="h-16 bg-gray-800 animate-pulse" />}>
          <SandboxHeader 
            currentUser={{
              name: session?.user?.name || 'User',
              email: session?.user?.email || '',
              role: 'USER'
            }}
            onReset={() => {
              setLogs([]);
              setAgentState({
                isProcessing: false,
                currentTask: undefined,
                progress: 0,
              });
            }}
          />
        </Suspense>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings Panel */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-6">
              <h1 className="text-3xl font-bold text-white mb-8">AI Sandbox</h1>
              <Suspense fallback={<div className="h-64 bg-gray-800 animate-pulse rounded-lg" />}>
                <SandboxSettings />
              </Suspense>
              <div className="mt-6">
                <button
                  onClick={handleTestAgent}
                  disabled={agentState.isProcessing}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    agentState.isProcessing
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {agentState.isProcessing ? 'Processing...' : 'Test Agent'}
                </button>
              </div>
            </div>

            {/* Agent Log Panel */}
            <div className="lg:h-[calc(100vh-12rem)] overflow-hidden">
              <AgentLog logs={logs} maxHeight="calc(100vh - 16rem)" />
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 