import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="h-20 bg-gray-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 