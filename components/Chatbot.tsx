import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const Chatbot: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot'; key?: string; action?: string }>>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  // Context-aware responses based on current page
  const getContextResponses = () => {
    const path = router.pathname;
    switch (path) {
      case '/dashboard':
        return {
          greeting: 'WELCOME_TO_DASHBOARD_\nYOU_CAN_VIEW_AND_MANAGE_YOUR_LEADS_AND_CAMPAIGNS_HERE_',
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
        };
      case '/leads':
        return {
          greeting: 'LEAD_MANAGEMENT_\nMANAGE_AND_TRACK_YOUR_LEADS_HERE_',
          help: [
            { text: 'VIEW_LEAD_DETAILS_', key: 'details' },
            { text: 'CLASSIFY_LEADS_', key: 'classify' },
            { text: 'EXPORT_LEAD_DATA_', key: 'export' },
            { text: 'GO_TO_DASHBOARD_', key: 'dashboard', action: '/dashboard' }
          ],
          responses: {
            'details': 'LEAD_DETAILS_VIEW_\nCLICK_ON_ANY_LEAD_TO_VIEW_\nFULL_INFORMATION_AND_HISTORY_',
            'classify': 'LEAD_CLASSIFICATION_\nUSE_THE_CLASSIFICATION_TOOL_\nTO_TAG_AND_CATEGORIZE_LEADS_',
            'export': 'EXPORT_OPTIONS_\n1_CSV_FORMAT_\n2_JSON_FORMAT_\n3_API_ENDPOINT_',
            'dashboard': 'NAVIGATING_TO_DASHBOARD_'
          }
        };
      case '/campaigns':
        return {
          greeting: 'CAMPAIGN_CONTROL_\nMANAGE_YOUR_MARKETING_CAMPAIGNS_HERE_',
          help: [
            { text: 'CREATE_NEW_CAMPAIGN_', key: 'create' },
            { text: 'MONITOR_CAMPAIGN_PERFORMANCE_', key: 'monitor' },
            { text: 'ADJUST_CAMPAIGN_SETTINGS_', key: 'settings' },
            { text: 'GO_TO_DASHBOARD_', key: 'dashboard', action: '/dashboard' }
          ],
          responses: {
            'create': 'NEW_CAMPAIGN_SETUP_\n1_SELECT_CAMPAIGN_TYPE_\n2_DEFINE_TARGET_AUDIENCE_\n3_SET_OBJECTIVES_',
            'monitor': 'PERFORMANCE_METRICS_\nOPEN_RATE_25%_\nCLICK_RATE_10%_\nCONVERSION_5%_',
            'settings': 'CAMPAIGN_SETTINGS_\nADJUST_IN_REAL_TIME_\nSAVE_CHANGES_AUTOMATICALLY_',
            'dashboard': 'NAVIGATING_TO_DASHBOARD_'
          }
        };
      default:
        return {
          greeting: 'WELCOME_TO_WINSTON_AI_\nYOUR_AI_POWERED_SALES_ASSISTANT_',
          help: [
            { text: 'GO_TO_DASHBOARD_', key: 'dashboard', action: '/dashboard' },
            { text: 'VIEW_SYSTEM_FEATURES_', key: 'features' },
            { text: 'REQUEST_A_DEMO_', key: 'demo', action: '/demo' },
            { text: 'CHECK_PRICING_OPTIONS_', key: 'pricing' }
          ],
          responses: {
            'dashboard': 'NAVIGATING_TO_DASHBOARD_',
            'features': 'KEY_FEATURES_\n1_AI_POWERED_LEAD_GENERATION_\n2_AUTOMATED_CAMPAIGNS_\n3_REAL_TIME_ANALYTICS_\n4_INTEGRATION_OPTIONS_',
            'demo': 'NAVIGATING_TO_DEMO_PAGE_',
            'pricing': 'PRICING_PLANS_\n1_STARTER_$99/MO_\n2_PRO_$299/MO_\n3_ENTERPRISE_CUSTOM_'
          }
        };
    }
  };

  useEffect(() => {
    if (isOpen) {
      const context = getContextResponses();
      setMessages([
        { text: context.greeting, sender: 'bot' },
        { text: 'AVAILABLE_COMMANDS_', sender: 'bot' },
        ...context.help.map(item => ({ text: item.text, sender: 'bot' as const, key: item.key, action: item.action }))
      ]);
    }
  }, [isOpen, router.pathname]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = input.trim().toLowerCase();
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    // Generate bot response
    setTimeout(() => {
      const context = getContextResponses();
      let response = 'I_DONT_UNDERSTAND_PLEASE_TRY_AGAIN_';
      
      // Check for matching responses
      for (const [key, value] of Object.entries(context.responses)) {
        if (userMessage.includes(key)) {
          response = value;
          break;
        }
      }

      setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
      setIsTyping(false);
    }, 1000);
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
                  {message.key ? (
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