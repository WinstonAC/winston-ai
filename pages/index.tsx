import Head from 'next/head';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import CsvUploader from '@/components/CsvUploader';

export default function Home() {
  return (
    <>
      <Head>
        <title>Winston AI - Automated Sales Outreach</title>
        <meta name="description" content="AI-powered sales outreach that books calls while you sleep" />
        <meta property="og:title" content="Winston AI - AI Outreach Engine" />
        <meta property="og:description" content="AI outreach that books calls while you sleep" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Ensure Courier New is available */}
        <link 
          rel="preload" 
          href="/fonts/CourierNew.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous" 
        />
      </Head>

      <div className="min-h-screen bg-brutalist-gray text-brutalist-black font-mono">
        <div className="max-w-screen-md mx-auto px-6">
          {/* Hero Section */}
          <div className="my-12 pb-12 border-b-thicc border-black">
            <Hero />
          </div>

          {/* How It Works Section */}
          <div className="my-12 pb-12 border-b-thicc border-black">
            <HowItWorks />
          </div>

          {/* CSV Upload Section */}
          <div className="my-12 pt-8 border-t-thicc border-black">
            <h2 className="text-3xl font-bold mb-8">
              📤 Upload Your Leads
            </h2>
            <CsvUploader />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t-thicc border-brutalist-black py-6 text-center">
          <p className="text-sm">
            Powered by Cylon Digital Consulting
          </p>
        </footer>
      </div>
    </>
  );
}
