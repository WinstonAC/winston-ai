import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();

  const messages: Record<string, AssistantMessage> = {
    '/': {
      title: 'Welcome to Winston AI',
      content: 'I can help you get started with Winston AI. Would you like to create an account or sign in to your existing one?',
      action: {
        text: 'Get Started',
        href: '/register'
      }
    },
    '/register': {
      title: 'Create Your Account',
      content: 'Let me help you set up your account. You can create a personal account or set up a team. I\'ll guide you through the process.',
      action: {
        text: 'Continue',
        href: '/register'
      }
    },
    '/login': {
      title: 'Sign In',
      content: 'Welcome back! Enter your credentials to access your account. Need help remembering your password?',
      action: {
        text: 'Forgot Password?',
        href: '/forgot-password'
      }
    },
    '/dashboard': {
      title: 'Your Dashboard',
      content: 'This is your command center. From here, you can manage your campaigns, leads, and team settings. Would you like a tour?',
      action: {
        text: 'Take Tour',
        href: '/dashboard/tour'
      }
    }
  };

  useEffect(() => {
    const path = router.pathname;
    if (messages[path]) {
      setCurrentMessage(messages[path]);
      setIsOpen(true);
    }
  }, [router.pathname]);

  if (!currentMessage) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-80 p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{currentMessage.title}</h3>
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