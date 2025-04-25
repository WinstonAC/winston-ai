import React, { useState } from 'react';

interface ChatbotProps {
  initialContext?: 'analytics' | 'general';
}

const Chatbot: React.FC<ChatbotProps> = ({ initialContext = 'general' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg"
      >
        Chat with Winston
      </button>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-white rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Winston AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="h-64 overflow-y-auto mb-4">
            <p className="text-gray-600">Hello! How can I help you today?</p>
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border rounded-l-lg px-4 py-2"
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded-r-lg">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 