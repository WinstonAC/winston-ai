import React, { useState } from 'react';
import Documentation from './Documentation';

const ExpandableDocs: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full text-left p-4 font-mono tracking-widest transition-colors ${
          isExpanded ? 'bg-[#32CD32] text-black' : 'bg-[#111111] text-white hover:bg-[#222222]'
        }`}
      >
        DOCUMENTATION_
      </button>
      
      {isExpanded && (
        <div className="border border-[#222222] bg-black p-4">
          <Documentation />
        </div>
      )}
    </div>
  );
};

export default ExpandableDocs; 