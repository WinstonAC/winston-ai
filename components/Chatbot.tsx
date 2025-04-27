import React, { useState } from 'react';

interface ChatbotProps {
  initialContext?: 'analytics' | 'general';
  onClose?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ initialContext = 'general', onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary hover:bg-primary-hover text-white font-heading font-bold py-2 px-4 rounded-full shadow-lg"
      >
        Chat with Winston
      </button>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-background border border-divider rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-bold text-white">Winston AI Assistant</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          <div className="h-64 overflow-y-auto mb-4">
            <p className="font-base text-gray-300">Hello! How can I help you today?</p>
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 font-base bg-input border-divider rounded-l-lg px-4 py-2 text-white placeholder-gray-500"
            />
            <button className="bg-primary hover:bg-primary-hover text-white font-heading font-semibold px-4 py-2 rounded-r-lg transition-colors">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 