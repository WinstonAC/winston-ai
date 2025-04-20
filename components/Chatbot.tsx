import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { ChatBubbleLeftIcon, XMarkIcon, QuestionMarkCircleIcon, ArrowPathIcon, CommandLineIcon } from '@heroicons/react/24/outline';

// Command synonyms and variations
const COMMAND_VARIATIONS = {
  'stats': ['stats', 'statistics', 'metrics', 'numbers', 'performance'],
  'campaigns': ['campaigns', 'marketing', 'ads', 'promotions'],
  'leads': ['leads', 'contacts', 'prospects', 'customers'],
  'dashboard': ['dashboard', 'home', 'main', 'overview'],
  'create': ['create', 'new', 'start', 'launch'],
  'monitor': ['monitor', 'track', 'watch', 'follow'],
  'settings': ['settings', 'configure', 'setup', 'options'],
  'help': ['help', 'how', 'what', 'explain', 'show me']
};

// Intent patterns
const INTENT_PATTERNS = {
  greeting: [/^hi$|^hello$|^hey$/i],
  help: [/help|what can you do|how do i/i],
  navigation: [/go to|navigate|take me|show me/i],
  status: [/status|how is|what's up|check/i]
};

// Analytics-specific responses
const ANALYTICS_RESPONSES = {
  chart: `The dashboard offers several chart types:
1. Line Chart: Shows trends over time
2. Bar Chart: Compares metrics across campaigns
3. Pie Chart: Displays metric distributions
4. Scatter Plot: Analyzes relationships between metrics
5. Area Chart: Shows cumulative metrics
6. Heatmap: Visualizes metric density

You can switch between chart types using the buttons in the visualization panel.`,

  metric: `Key metrics available:
- Sent: Total emails sent
- Delivered: Successfully delivered emails
- Opened: Emails opened by recipients
- Clicked: Links clicked in emails
- Bounced: Failed deliveries
- Replies: Email responses received
- Meetings: Meetings scheduled

You can view these metrics in different visualizations and export them for further analysis.`,

  export: `You can export your data in multiple formats:
1. CSV: For spreadsheet analysis
2. Excel: For detailed reporting
3. PDF: For sharing and printing
4. JSON: For API integration

Click the Export button and select your preferred format.`,

  compare: `To compare campaigns:
1. Select multiple campaigns using the checkboxes
2. Click the "Compare" button
3. Choose your preferred visualization type
4. Use the metric selectors to compare specific metrics

You can also toggle annotations and view detailed tooltips for deeper analysis.`,

  realtime: `The dashboard provides real-time updates:
- Metrics are automatically refreshed
- Last update time is shown in the header
- Offline mode is available if connection is lost
- WebSocket connection status is indicated

You can also manually refresh data using the refresh button.`
};

// Add quick actions based on context
const QUICK_ACTIONS = {
  analytics: [
    { label: 'View Charts', command: 'chart' },
    { label: 'Check Metrics', command: 'metric' },
    { label: 'Export Data', command: 'export' },
    { label: 'Compare Campaigns', command: 'compare' },
  ],
  general: [
    { label: 'View Stats', command: 'stats' },
    { label: 'Manage Campaigns', command: 'campaigns' },
    { label: 'Check Leads', command: 'leads' },
    { label: 'System Status', command: 'status' },
  ],
};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'action' | 'form';
  data?: any;
  key?: string;
  action?: string;
}

interface ChatbotProps {
  initialContext?: 'analytics' | 'general';
  onClose?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ initialContext = 'general', onClose }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<'analytics' | 'general'>(initialContext);
  const [conversationContext, setConversationContext] = useState<{
    currentStep?: string;
    formData?: Record<string, any>;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);

  // Initialize messages based on context
  useEffect(() => {
    const initialMessage = context === 'analytics' 
      ? 'Hello! I can help you with the analytics dashboard. What would you like to know about?'
      : 'Hello! I can help you navigate and manage your leads and campaigns. What would you like to do?';
    
    setMessages([{
      id: '1',
      text: initialMessage,
      sender: 'bot',
      timestamp: new Date(),
    }]);
  }, [context]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      }
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

  // Handle analytics-specific queries
  const handleAnalyticsQuery = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('chart') || lowerInput.includes('graph')) {
      return ANALYTICS_RESPONSES.chart;
    }

    if (lowerInput.includes('metric') || lowerInput.includes('data')) {
      return ANALYTICS_RESPONSES.metric;
    }

    if (lowerInput.includes('export') || lowerInput.includes('download')) {
      return ANALYTICS_RESPONSES.export;
    }

    if (lowerInput.includes('compare') || lowerInput.includes('campaign')) {
      return ANALYTICS_RESPONSES.compare;
    }

    if (lowerInput.includes('real-time') || lowerInput.includes('update')) {
      return ANALYTICS_RESPONSES.realtime;
    }

    if (lowerInput.includes('help') || lowerInput.includes('how')) {
      return `Here are some common tasks I can help with:
1. Understanding different chart types
2. Interpreting metrics and data
3. Exporting data in various formats
4. Comparing campaigns
5. Real-time updates and offline mode
6. Customizing the dashboard view

What specific feature would you like to know more about?`;
    }

    return `I'm not sure I understand. Could you try rephrasing your question? 
You can ask about:
- Chart types and visualizations
- Metrics and data interpretation
- Exporting data
- Comparing campaigns
- Real-time updates
- Dashboard customization`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Process input
    const command = matchCommand(input);
    const multiStepResponse = handleMultiStep(command);

    if (multiStepResponse) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: multiStepResponse,
        sender: 'bot',
        timestamp: new Date(),
      }]);
      setIsTyping(false);
      return;
    }

    // Generate response
    setTimeout(() => {
      let response: string;
      
      if (context === 'analytics') {
        response = handleAnalyticsQuery(input);
      } else {
        const contextResponses = getContextResponses();
        response = command ? contextResponses.responses[command] : 'I_DONT_UNDERSTAND_PLEASE_TRY_AGAIN_';
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 1000);
  };

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
        break;
    }

    return null;
  };

  const clearChat = () => {
    setMessages([]);
    const initialMessage = context === 'analytics' 
      ? 'Hello! I can help you with the analytics dashboard. What would you like to know about?'
      : 'Hello! I can help you navigate and manage your leads and campaigns. What would you like to do?';
    
    setMessages([{
      id: '1',
      text: initialMessage,
      sender: 'bot',
      timestamp: new Date(),
    }]);
  };

  const handleQuickAction = (command: string) => {
    setInput(command);
    handleSubmit(new Event('submit') as any);
    setShowQuickActions(false);
  };

  const toggleContext = () => {
    setContext(prev => prev === 'analytics' ? 'general' : 'analytics');
    clearChat();
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-black border-2 border-white p-4 rounded-none
                 text-white font-mono text-base tracking-normal hover:bg-white hover:text-black transition-colors"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftIcon className="h-6 w-6" />
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 bg-black border-2 border-white
                      font-mono text-white overflow-hidden text-base tracking-normal">
          {/* Chat Header */}
          <div className="p-4 border-b-2 border-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 border-2 border-white">
                  <QuestionMarkCircleIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-mono font-bold tracking-normal">
                    {context === 'analytics' ? 'ANALYTICS_HELP_' : 'WINSTON_CHAT_'}
                  </h3>
                  <p className="text-sm text-gray-400 tracking-normal">
                    {context === 'analytics' 
                      ? 'ASK_ABOUT_CHARTS_METRICS_DATA_'
                      : 'HOW_CAN_I_HELP_YOU_TODAY_'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleContext}
                  className="p-2 border-2 border-white hover:bg-white hover:text-black transition-colors"
                  title={`SWITCH_TO_${context === 'analytics' ? 'GENERAL' : 'ANALYTICS'}_MODE_`}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className="p-2 border-2 border-white hover:bg-white hover:text-black transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="p-4 border-b-2 border-white">
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS[context].map((action) => (
                  <button
                    key={action.command}
                    onClick={() => handleQuickAction(action.command)}
                    className="p-2 border-2 border-white text-sm tracking-normal
                             hover:bg-white hover:text-black transition-colors"
                  >
                    {action.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 border-2 ${
                    message.sender === 'user'
                      ? 'bg-white text-black border-white'
                      : 'bg-black text-white border-white'
                  }`}
                >
                  {message.type === 'form' ? (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      // Handle form submission
                    }}>
                      {message.data.fields.map((field: any, i: number) => (
                        <div key={i} className="mb-4">
                          <label className="block text-sm font-mono font-bold tracking-normal mb-1">
                            {field.label.toUpperCase()}
                          </label>
                          {field.type === 'text' && (
                            <input
                              type="text"
                              className="w-full bg-black border-2 border-white text-white px-3 py-2
                                       font-mono tracking-normal focus:outline-none focus:bg-white focus:text-black"
                              name={field.name}
                            />
                          )}
                          {field.type === 'select' && (
                            <select
                              className="w-full bg-black border-2 border-white text-white px-3 py-2
                                       font-mono tracking-normal focus:outline-none focus:bg-white focus:text-black"
                              name={field.name}
                            >
                              {field.options.map((opt: string, j: number) => (
                                <option key={j} value={opt}>{opt.toUpperCase()}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                      <button
                        type="submit"
                        className="w-full bg-white text-black px-4 py-2 border-2 border-white
                                 font-mono font-bold tracking-normal hover:bg-black hover:text-white transition-colors"
                      >
                        SUBMIT_
                      </button>
                    </form>
                  ) : (
                    <div className="text-sm font-mono tracking-normal leading-relaxed">
                      {message.text.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 last:mb-0">
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
                <div className="border-2 border-white p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white animate-bounce" />
                    <div className="w-2 h-2 bg-white animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-white animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t-2 border-white">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={context === 'analytics' 
                  ? "ASK_ABOUT_CHARTS_METRICS_DATA..." 
                  : "TYPE_MESSAGE_"}
                className="flex-1 bg-black border-2 border-white text-white px-4 py-3
                         font-mono tracking-normal placeholder-gray-500 focus:outline-none
                         focus:bg-white focus:text-black"
              />
              <button
                type="submit"
                className="bg-white text-black px-6 py-3 border-2 border-white
                         font-mono font-bold tracking-normal hover:bg-black hover:text-white transition-colors"
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