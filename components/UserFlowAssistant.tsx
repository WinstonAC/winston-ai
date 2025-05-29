import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AssistantMessage {
  title: string;
  content: string;
  action?: {
    text: string;
    href: string;
  };
}

const UserFlowAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<AssistantMessage | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const messages = useMemo<Record<string, AssistantMessage>>(() => ({
    '/': {
      title: 'Welcome',
      content: 'Welcome to Winston AI! How can I help you today?'
    },
    '/dashboard': {
      title: 'Dashboard',
      content: 'Here you can manage your leads and campaigns.'
    },
    '/analytics': {
      title: 'Analytics',
      content: 'View your campaign performance and metrics here.'
    }
  }), []);

  useEffect(() => {
    if (isClient && router.isReady) {
      const path = router.pathname;
      if (messages[path]) {
        setCurrentMessage(messages[path]);
        setIsOpen(true);
      } else {
        setIsOpen(false);
        setCurrentMessage(null);
      }
    }
  }, [isClient, messages, router.isReady, router.pathname]);

  if (!currentMessage && !isOpen && !loading) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-80 p-4">
          <div className="flex justify-between items-start mb-2">
            {currentMessage && (
              <h3 className="text-lg font-semibold text-gray-900">
                {currentMessage.title}
              </h3>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">{currentMessage.content}</p>
          {currentMessage.action && (
            <a
              href={currentMessage.action.href}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {currentMessage.action.text}
            </a>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700"
        >
          <ChatBubbleLeftIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default UserFlowAssistant; 