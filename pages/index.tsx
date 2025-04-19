import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-black"></div>
      <div className="relative h-screen text-white overflow-hidden">
        <Head>
          <title>Winston AI - Automated Lead Management</title>
          <meta name="description" content="Winston AI automates your cold emails, replies, and demo booking" />
        </Head>

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-gray-900 to-black"></div>

        {/* Main content */}
        <div className="h-full flex flex-col">
          <main className="flex-grow flex items-center justify-center px-4">
            {/* Floating circles */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute w-[400px] h-[400px] rounded-full bg-white/5 backdrop-blur-3xl"
                style={{
                  animation: 'float-circle-1 20s ease-in-out infinite',
                  top: '10%',
                  left: '20%'
                }}
              />
              <div 
                className="absolute w-[300px] h-[300px] rounded-full bg-white/10 backdrop-blur-3xl"
                style={{
                  animation: 'float-circle-2 15s ease-in-out infinite',
                  top: '40%',
                  right: '15%'
                }}
              />
              <div 
                className="absolute w-[200px] h-[200px] rounded-full bg-white/5 backdrop-blur-3xl"
                style={{
                  animation: 'float-circle-3 18s ease-in-out infinite',
                  bottom: '20%',
                  left: '35%'
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
              <h1 
                className="text-7xl font-extralight mb-8 opacity-0 animate-slide-up"
                style={{ animationDelay: '0.5s' }}
              >
                Winston AI
              </h1>
              <p 
                className="text-4xl font-light text-gray-300 mb-6 opacity-0 animate-slide-up"
                style={{ animationDelay: '1s' }}
              >
                The AI agent that does the work you dread.
              </p>
              <p 
                className="text-xl text-gray-400 opacity-0 animate-slide-up"
                style={{ animationDelay: '1.5s' }}
              >
                Cold emails, replies, and demo booking — handled.
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#222222] z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-sm font-mono tracking-widest" style={{ color: 'rgb(50, 205, 50)' }}>
            POWERED_BY_CYLON_DIGITAL
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float-circle-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(-100px, 50px) rotate(-180deg) scale(1.2); }
        }

        @keyframes float-circle-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(80px, -70px) rotate(180deg) scale(0.8); }
        }

        @keyframes float-circle-3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(-60px, -60px) rotate(-90deg) scale(1.1); }
        }

        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-fade-in-delay-1 {
          animation: fade-in 1s ease-out 0.5s forwards;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
        }
      `}</style>
    </div>
  );
}