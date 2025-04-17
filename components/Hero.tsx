import React from 'react';
import { COLORS } from '@/lib/theme';

const Hero: React.FC = () => {
  return (
    <section className="w-full bg-brutalist-gray border-thicc border-brutalist-black">
      <div className="max-w-7xl mx-auto px-box py-box">
        <h1 className="brutalist-shouty mb-box">
          Winston AI
        </h1>
        <p className="brutalist-heading max-w-2xl">
          AI outreach that books calls while you sleep
        </p>
        <div className="brutalist-box mt-box">
          <a 
            href="#demo" 
            className="inline-block font-mono px-box py-4 bg-brutalist-lime 
                     border-thicc border-brutalist-black hover:bg-white"
          >
            Watch Demo
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero; 