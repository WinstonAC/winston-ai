import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  initialContext?: 'analytics' | 'general';
  onClose?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ initialContext = 'general', onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello! I\'m Winston, your AI sales assistant. How can I help you today?', sender: 'bot', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: initialContext
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      
      const botResponse: Message = {
        text: data.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        text: 'Sorry, I encountered an error. Please try again. (Note: OpenAI API key may not be configured)',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isClient) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#32CD32] hover:bg-[#32CD32]/90 text-black font-mono font-bold py-3 px-4 rounded-full shadow-lg transition-colors text-sm"
      >
        Chat with Winston
      </button>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 max-w-[calc(100vw-2rem)] bg-black border-2 border-[#32CD32] rounded-lg shadow-xl z-50">
          <div className="flex justify-between items-center p-4 border-b border-[#32CD32]">
            <h3 className="font-mono font-bold text-[#32CD32] text-sm">Winston AI Assistant</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="h-60 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-[#32CD32] text-black'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <p className="text-xs font-mono leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-white p-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 p-4 border-t border-gray-800">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-2 bg-gray-900 border border-gray-600 rounded text-white text-sm font-mono focus:outline-none focus:border-[#32CD32]"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-[#32CD32] text-black px-3 py-2 rounded font-mono font-bold text-xs hover:bg-[#32CD32]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 