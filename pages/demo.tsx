import Head from 'next/head';

export default function Demo() {
  return (
    <>
      <Head>
        <title>Watch Demo | Winston AI</title>
        <meta name="description" content="See how Winston AI automates your email outreach and books calls while you sleep" />
      </Head>

      <div className="min-h-screen bg-brutalist-gray text-black font-mono">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          {/* Header */}
          <h1 className="text-4xl font-bold mb-8">
            🎥 Winston AI Demo
          </h1>

          {/* Video Container */}
          <div className="border-thicc border-black bg-white p-4 mb-12">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.youtube.com/embed/your-video-id"
                title="Winston AI Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>

          {/* CTA Section */}
          <div className="border-thicc border-black bg-white p-8">
            <h2 className="text-2xl font-bold mb-4">
              Want more? Book a call.
            </h2>
            <p className="mb-6">
              See how Winston AI can work for your specific business needs. 
              Book a 15-minute demo call with our team.
            </p>
            <a
              href="https://calendly.com/your-link"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-black text-white px-8 py-4 
                       border-thicc border-black hover:bg-white hover:text-black 
                       transition-colors uppercase tracking-wider"
            >
              Schedule Demo Call
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[
              {
                icon: "⚡",
                title: "Quick Setup",
                description: "Upload your leads and start booking calls in minutes"
              },
              {
                icon: "🎯",
                title: "Smart Targeting",
                description: "AI-powered personalization for each prospect"
              },
              {
                icon: "📈",
                title: "High Conversion",
                description: "3-5x more booked calls than manual outreach"
              },
              {
                icon: "🔄",
                title: "Auto Follow-up",
                description: "Never miss a lead with automated responses"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="border-thicc border-black bg-white p-6"
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 