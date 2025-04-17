import Head from 'next/head';

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing – Winston AI</title>
        <meta name="description" content="Simple, transparent pricing for Winston AI" />
      </Head>

      <div className="max-w-screen-md mx-auto px-6 py-12 font-mono text-black bg-brutalist-gray">
        <h1 className="text-3xl font-bold mb-6">Pricing</h1>
        
        <div className="border-2 border-black bg-white p-6">
          <h2 className="text-xl font-bold mb-2">Simple Pricing</h2>
          <p className="text-2xl font-bold mb-4">$99/month</p>
          <ul className="space-y-2 text-sm">
            <li>✓ Unlimited Leads</li>
            <li>✓ AI Outreach</li>
            <li>✓ Calendar Integration</li>
          </ul>
        </div>
      </div>
    </>
  );
} 