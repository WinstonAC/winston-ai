import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Winston is the AI agent that does the work you dread.
          </h1>
          
          {/* Subheadline */}
          <p className="text-2xl md:text-3xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Cold emails, replies, and demo booking — handled.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/demo"
              className="inline-flex items-center justify-center px-8 py-4 border border-2 border-blue-600 text-base font-medium rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Watch Demo
            </Link>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Automated Outreach</h3>
            <p className="text-gray-600">Let Winston handle your cold email campaigns while you focus on what matters.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Smart Replies</h3>
            <p className="text-gray-600">AI-powered responses that maintain your brand voice and convert leads.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Demo Booking</h3>
            <p className="text-gray-600">Automated scheduling that works 24/7 to book meetings with interested prospects.</p>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500">Trusted by forward-thinking teams</p>
          <div className="flex justify-center gap-8 mt-4">
            {/* Add your trust indicators/logos here */}
          </div>
        </motion.div>
      </div>
    </main>
  );
} 