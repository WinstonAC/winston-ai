import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

// Command synonyms and variations
const COMMAND_VARIATIONS = {
  'stats': ['stats', 'statistics', 'metrics', 'numbers', 'performance'],
  'campaigns': ['campaigns', 'marketing', 'ads', 'promotions'],
  'leads': ['leads', 'contacts', 'prospects', 'customers'],
  'dashboard': ['dashboard', 'home', 'main', 'overview'],
  'create': ['create', 'new', 'start', 'launch'],
  'monitor': ['monitor', 'track', 'watch', 'follow'],
  'settings': ['settings', 'configure', 'setup', 'options']
};

// Intent patterns
const INTENT_PATTERNS = {
  greeting: [/^hi$|^hello$|^hey$/i],
  help: [/help|what can you do|how do i/i],
  navigation: [/go to|navigate|take me|show me/i],
  status: [/status|how is|what's up|check/i]
};

const Chatbot: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{
    text: string;
    sender: 'user' | 'bot';
    key?: string;
    action?: string;
    type?: 'text' | 'action' | 'form';
    data?: any;
  }>>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<{
    currentStep?: string;
    formData?: Record<string, any>;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Enhanced context-aware responses
  const getContextResponses = () => {
    const path = router.pathname;
    const userRole = session?.user?.role || 'USER';
    const teamId = session?.user?.teamId;

    const baseResponses = {
      dashboard: {
        greeting: `WELCOME_TO_DASHBOARD_\nYOU_CAN_VIEW_AND_MANAGE_YOUR_LEADS_AND_CAMPAIGNS_HERE_`,
        help: [
          { text: 'VIEW_YOUR_LEAD_STATS_', key: 'stats' },
          { text: 'MANAGE_YOUR_CAMPAIGNS_', key: 'campaigns', action: '/campaigns' },
          { text: 'UPLOAD_NEW_LEADS_', key: 'leads', action: '/leads' },
          { text: 'CHECK_SYSTEM_STATUS_', key: 'status' }
        ],
        responses: {
          'stats': 'CURRENT_METRICS_\nLEADS_123_\nACTIVE_CAMPAIGNS_5_\nCONVERSION_RATE_12%_',
          'campaigns': 'NAVIGATING_TO_CAMPAIGNS_',
          'leads': 'NAVIGATING_TO_LEADS_',
          'status': 'SYSTEM_STATUS_\nOPERATIONAL_\nPERFORMANCE_OPTIMAL_\nLAST_UPDATE_2M_AGO_'
        }
      },
      // ... other path responses ...
    };

    // Add role-specific responses
    if (userRole === 'ADMIN') {
      baseResponses.dashboard.help.push(
        { text: 'MANAGE_TEAM_SETTINGS_', key: 'team', action: '/team' }
      );
      baseResponses.dashboard.responses['team'] = 'NAVIGATING_TO_TEAM_SETTINGS_';
    }

    return baseResponses[path] || baseResponses.default;
  };

  // Enhanced command matching
  const matchCommand = (input: string) => {
    const normalizedInput = input.toLowerCase().trim();
    
    // Check for exact matches first
    for (const [key, variations] of Object.entries(COMMAND_VARIATIONS)) {
      if (variations.includes(normalizedInput)) {
        return key;
      }
    }

    // Check for fuzzy matches
    for (const [key, variations] of Object.entries(COMMAND_VARIATIONS)) {
      for (const variation of variations) {
        if (normalizedInput.includes(variation)) {
          return key;
        }
      }
    }

    // Check for intent patterns
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedInput)) {
          return intent;
        }
      }
    }

    return null;
  };

  // Handle multi-step conversations
  const handleMultiStep = (command: string) => {
    const { currentStep, formData } = conversationContext;

    switch (currentStep) {
      case 'creating_campaign':
        if (!formData) {
          setConversationContext({
            currentStep: 'creating_campaign',
            formData: { type: command }
          });
          return 'SELECT_TARGET_AUDIENCE_';
        }
        if (!formData.audience) {
          setConversationContext({
            currentStep: 'creating_campaign',
            formData: { ...formData, audience: command }
          });
          return 'SET_CAMPAIGN_OBJECTIVES_';
        }
        // ... handle other steps
        break;
      // ... other multi-step scenarios
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    // Process input
    const command = matchCommand(input);
    const multiStepResponse = handleMultiStep(command);

    if (multiStepResponse) {
      setMessages(prev => [...prev, { text: multiStepResponse, sender: 'bot' }]);
      setIsTyping(false);
      return;
    }

    // Generate response
    setTimeout(() => {
      const context = getContextResponses();
      let response = 'I_DONT_UNDERSTAND_PLEASE_TRY_AGAIN_';
      
      if (command) {
        response = context.responses[command] || response;
      }

      // Add interactive elements if needed
      const message: any = { text: response, sender: 'bot' };
      
      if (command === 'create') {
        message.type = 'form';
        message.data = {
          fields: [
            { type: 'text', label: 'CAMPAIGN_NAME_', name: 'name' },
            { type: 'select', label: 'CAMPAIGN_TYPE_', name: 'type', options: ['EMAIL_', 'SMS_', 'SOCIAL_'] }
          ]
        };
      }

      setMessages(prev => [...prev, message]);
      setIsTyping(false);
    }, 1000);
  };

  const handleTopicClick = (key: string, action?: string) => {
    const context = getContextResponses();
    const response = context.responses[key];
    
    if (response) {
      setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
    }

    if (action) {
      setTimeout(() => {
        router.push(action);
      }, 1000);
    }
  };

  const clearChat = () => {
    setMessages([]);
    const context = getContextResponses();
    setMessages([
      { text: context.greeting, sender: 'bot' },
      { text: 'AVAILABLE_COMMANDS_', sender: 'bot' },
      ...context.help.map(item => ({ text: item.text, sender: 'bot' as const, key: item.key, action: item.action }))
    ]);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 border border-gray-800 p-4 rounded-lg
                 text-white font-mono tracking-wider hover:bg-gray-800 transition-colors"
      >
        {isOpen ? 'CLOSE_CHAT_' : 'OPEN_CHAT_'}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 bg-gray-900 border border-gray-800 rounded-lg
                      font-mono text-white overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-lg tracking-wider">WINSTON_CHAT_</h3>
            <button
              onClick={clearChat}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              CLEAR_
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] p-4 rounded-lg break-words ${
                    message.sender === 'user'
                      ? 'bg-[#32CD32] text-black'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  {message.type === 'form' ? (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      // Handle form submission
                    }}>
                      {message.data.fields.map((field: any, i: number) => (
                        <div key={i} className="mb-4">
                          <label className="block text-sm mb-2">{field.label}</label>
                          {field.type === 'text' && (
                            <input
                              type="text"
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                              name={field.name}
                            />
                          )}
                          {field.type === 'select' && (
                            <select
                              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                              name={field.name}
                            >
                              {field.options.map((opt: string, j: number) => (
                                <option key={j} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                      <button
                        type="submit"
                        className="bg-[#32CD32] text-black px-4 py-2 rounded font-mono tracking-wider"
                      >
                        SUBMIT_
                      </button>
                    </form>
                  ) : message.key ? (
                    <button
                      onClick={() => handleTopicClick(message.key!, message.action)}
                      className="text-left w-full hover:text-[#32CD32] transition-colors whitespace-pre-wrap text-sm"
                    >
                      {message.text.split('\n').map((line, i) => (
                        <p key={i} className="tracking-wider break-words leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </button>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm">
                      {message.text.split('\n').map((line, i) => (
                        <p key={i} className="tracking-wider break-words leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="tracking-wider animate-pulse">TYPING_</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="TYPE_MESSAGE_"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                         text-white placeholder-gray-500 focus:outline-none focus:border-[#32CD32]
                         text-sm tracking-wider"
              />
              <button
                type="submit"
                className="bg-[#32CD32] text-black px-6 py-3 rounded-lg font-mono tracking-wider
                         hover:bg-[#2db82d] transition-colors text-sm"
              >
                SEND_
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot; 