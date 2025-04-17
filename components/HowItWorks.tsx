import React from 'react';

const steps = [
  {
    id: 1,
    title: 'Upload CSV',
    description: 'Upload your leads with names and email addresses'
  },
  {
    id: 2,
    title: 'Winston Reaches Out',
    description: 'AI automatically engages with your leads'
  },
  {
    id: 3,
    title: 'Booked Calls',
    description: 'Wake up to new calls on your calendar'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <div className="font-mono">
      {/* Steps Section */}
      <section className="bg-[#e5e5e5] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className="border-2 border-black p-6 bg-white"
              >
                <div className="text-xl font-bold mb-4">{step.title}</div>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12">Watch Demo</h2>
          <div className="aspect-w-16 aspect-h-9 border-2 border-black">
            <iframe 
              src="https://www.youtube.com/embed/your-video-id" 
              className="w-full h-[500px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#e5e5e5]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12">Pricing</h2>
          <div className="border-2 border-black bg-white p-8">
            <div className="text-2xl font-bold mb-4">Simple Pricing</div>
            <div className="text-4xl font-bold mb-4">$99/month</div>
            <ul className="space-y-4">
              <li>✓ Unlimited Leads</li>
              <li>✓ AI Outreach</li>
              <li>✓ Calendar Integration</li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12">About</h2>
          <div className="border-2 border-black p-8">
            <p className="text-lg">
              Winston AI is the future of automated outreach. Our AI understands context,
              crafts personalized messages, and books calls while you focus on closing deals.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#e5e5e5] border-t-2 border-black">
        <div className="max-w-6xl mx-auto px-4 text-center">
          Powered by Cylon Digital Consulting
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks; 