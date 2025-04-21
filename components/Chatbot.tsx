import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { ChatBubbleLeftIcon, XMarkIcon, QuestionMarkCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

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

// Page-specific help messages
const PAGE_HELP = {
  '/dashboard': 'Welcome to your Dashboard! Would you like help with:\n1. Viewing campaign metrics\n2. Managing leads\n3. Creating new campaigns',
  '/campaigns': 'This is your Campaign Manager! Need help with:\n1. Creating a new campaign\n2. Managing existing campaigns\n3. Understanding campaign metrics',
  '/analytics': 'Welcome to Analytics! Would you like to learn about:\n1. Available metrics\n2. Chart types\n3. Exporting data',
  '/leads': 'Welcome to Lead Management! Need help with:\n1. Importing leads\n2. Managing segments\n3. Lead enrichment',
  '/team': 'Team Management Center! Need assistance with:\n1. Adding team members\n2. Setting permissions\n3. Managing roles'
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
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(true);
  const [currentPage, setCurrentPage] = useState(router.pathname);
  const [showPageHelp, setShowPageHelp] = useState(false);
  const [showHelpBubble, setShowHelpBubble] = useState(false);
  const isLandingPage = router.pathname === '/';

  // Initialize messages based on context and page
  useEffect(() => {
    if (isLandingPage) {
      setMessages([{
        id: '1',
        text: 'WELCOME_TO_WINSTON_AI_\n\nI_CAN_HELP_YOU_WITH:\n1. UNDERSTANDING_OUR_FEATURES_\n2. EXPLORING_USE_CASES_\n3. GETTING_STARTED_\n\nWHAT_WOULD_YOU_LIKE_TO_KNOW_',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } else {
      const initialMessage = context === 'analytics' 
        ? 'HELLO_I_CAN_HELP_YOU_WITH_THE_ANALYTICS_DASHBOARD_WHAT_WOULD_YOU_LIKE_TO_KNOW_'
        : 'HELLO_I_CAN_HELP_YOU_NAVIGATE_AND_MANAGE_YOUR_LEADS_AND_CAMPAIGNS_WHAT_WOULD_YOU_LIKE_TO_DO_';
      
      setMessages([{
        id: '1',
        text: initialMessage,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  }, [context, isLandingPage]);

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

  useEffect(() => {
    // Show welcome notification for 5 seconds
    const timer = setTimeout(() => {
      setShowWelcomeNotification(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const path = url.split('?')[0];
      setCurrentPage(path);
      
      if (path === '/') {
        setShowHelpBubble(false);
        setShowPageHelp(false);
      } else if (!isOpen && !showHelpBubble) {
        setShowHelpBubble(true);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, isOpen, showHelpBubble]);

  // Enhanced context-aware responses
  const getContextResponses = () => {
    const path = router.pathname;
    const userRole = session?.user?.role || 'USER';
    const teamId = session?.user?.teamId;

    const baseResponses = {
      '/dashboard': {
        greeting: `Welcome to Dashboard\nYou can view and manage your leads and campaigns here`,
        help: [
          { text: 'View your lead stats', key: 'stats' },
          { text: 'Manage your campaigns', key: 'campaigns', action: '/campaigns' },
          { text: 'Upload new leads', key: 'leads', action: '/leads' },
          { text: 'Check system status', key: 'status' }
        ]
      },
      '/campaigns': {
        help: [
          { text: 'Create new campaign', key: 'create' },
          { text: 'View campaign metrics', key: 'metrics' },
          { text: 'Manage templates', key: 'templates' },
          { text: 'Schedule campaign', key: 'schedule' }
        ]
      },
      '/analytics': {
        help: [
          { text: 'View charts', key: 'charts' },
          { text: 'Export data', key: 'export' },
          { text: 'Compare campaigns', key: 'compare' }
        ]
      },
      '/leads': {
        help: [
          { text: 'Import leads', key: 'import' },
          { text: 'Manage segments', key: 'segments' },
          { text: 'Enrich leads', key: 'enrich' }
        ]
      }
    };

    return baseResponses[path] || baseResponses['/dashboard'];
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
    switch (command) {
      case 'stats':
        router.push('/analytics');
        break;
      case 'campaigns':
        router.push('/campaigns');
        break;
      case 'leads':
        router.push('/leads');
        break;
      case 'status':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: 'SYSTEM_STATUS_OPERATIONAL_',
          sender: 'bot',
          timestamp: new Date(),
        }]);
        break;
      case 'chart':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: ANALYTICS_RESPONSES.chart,
          sender: 'bot',
          timestamp: new Date(),
        }]);
        break;
      case 'metric':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: ANALYTICS_RESPONSES.metric,
          sender: 'bot',
          timestamp: new Date(),
        }]);
        break;
      case 'export':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: ANALYTICS_RESPONSES.export,
          sender: 'bot',
          timestamp: new Date(),
        }]);
        break;
      case 'compare':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: ANALYTICS_RESPONSES.compare,
          sender: 'bot',
          timestamp: new Date(),
        }]);
        break;
    }
    setShowQuickActions(false);
  };

  const toggleContext = () => {
    setContext(prev => prev === 'analytics' ? 'general' : 'analytics');
    clearChat();
  };

  return (
    <>
      {/* Welcome Notification - Only show on non-landing pages */}
      {showWelcomeNotification && !isLandingPage && (
        <div className="fixed bottom-32 right-4 z-50 bg-black border-2 border-[#32CD32] p-4 w-64
                      font-mono text-white animate-fade-in-up">
          <div className="flex items-center justify-between">
            <p className="text-sm">WINSTON_AI_ASSISTANT_IS_READY_TO_HELP_</p>
            <button 
              onClick={() => setShowWelcomeNotification(false)}
              className="text-[#32CD32] hover:text-white"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-80 bg-black border border-gray-800
                      font-mono text-white shadow-lg shadow-gray-900/50 max-h-[60vh] flex flex-col">
          {/* Chat Header */}
          <div className="p-2.5 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 border border-gray-700 text-gray-400">
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold tracking-wider text-gray-300">
                    {context === 'analytics' ? 'ANALYTICS_HELP_' : 'WINSTON_CHAT_'}
                  </h3>
                  <p className="text-xs text-gray-500 tracking-wider">
                    {context === 'analytics' 
                      ? 'ASK_ABOUT_CHARTS_METRICS_DATA_'
                      : 'HOW_CAN_I_HELP_YOU_TODAY_'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={toggleContext}
                  className="p-1.5 border border-gray-700 text-gray-400 
                           hover:bg-gray-800 hover:text-gray-300 transition-colors"
                  title={`SWITCH_TO_${context === 'analytics' ? 'GENERAL' : 'ANALYTICS'}_MODE_`}
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className="p-1.5 border border-gray-700 text-gray-400 
                           hover:bg-gray-800 hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="p-4 border-b border-gray-800">
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS[context].map((action) => (
                  <button
                    key={action.command}
                    onClick={() => handleQuickAction(action.command)}
                    className="border border-gray-700 p-3 font-mono text-xs tracking-widest
                             text-gray-400 hover:text-gray-300 transition-colors uppercase
                             bg-black hover:border-gray-600"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] border border-gray-700 ${
                    message.sender === 'user'
                      ? 'bg-gray-900'
                      : 'bg-black'
                  }`}
                >
                  <div className="p-3 text-xs font-mono tracking-widest text-gray-400 break-words">
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="border border-gray-700 p-2">
                  <div className="flex space-x-2">
                    <div className="w-1.5 h-1.5 bg-gray-500 animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-500 animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 bg-gray-500 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-800 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="TYPE MESSAGE"
                className="flex-1 bg-black border border-gray-700 p-3
                         font-mono text-xs tracking-widest text-gray-300
                         placeholder-gray-600 focus:outline-none focus:border-gray-600"
              />
              <button
                type="submit"
                className="border border-gray-700 bg-black text-gray-300 px-6 py-3
                         font-mono text-xs tracking-widest uppercase hover:text-white
                         hover:border-gray-600 transition-colors"
              >
                SEND
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Help Bubble */}
      {showHelpBubble && !isOpen && !isLandingPage && (
        <div className="fixed bottom-16 right-4 z-50 bg-black border border-gray-800 p-2.5 w-64
                      font-mono text-white shadow-lg shadow-gray-900/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 tracking-wider">NEED_HELP_WITH_THIS_PAGE_</p>
            <button 
              onClick={() => setShowHelpBubble(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setShowHelpBubble(false);
                setIsOpen(true);
              }}
              className="px-3 py-1.5 border border-gray-700 text-gray-400 text-xs tracking-wider
                       hover:bg-gray-800 hover:text-gray-300"
            >
              YES_
            </button>
            <button
              onClick={() => setShowHelpBubble(false)}
              className="px-3 py-1.5 border border-gray-700 text-gray-500 text-xs tracking-wider
                       hover:bg-gray-800 hover:text-gray-400"
            >
              NO_
            </button>
          </div>
        </div>
      )}

      {/* Page Help Prompt */}
      {showPageHelp && (
        <div className="fixed top-20 right-4 z-50 bg-black border-2 border-[#32CD32] p-4 w-64
                      font-mono text-white animate-fade-in-down">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#32CD32]">NEW_PAGE_DETECTED_</p>
            <button 
              onClick={() => setShowPageHelp(false)}
              className="text-[#32CD32] hover:text-white"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm">Would you like help with this page?</p>
          <div className="mt-2 space-x-2">
            <button
              onClick={() => {
                setShowPageHelp(false);
                handleQuickAction('help');
              }}
              className="px-3 py-1 border-2 border-[#32CD32] text-[#32CD32] hover:bg-[#32CD32] hover:text-black"
            >
              YES_
            </button>
            <button
              onClick={() => setShowPageHelp(false)}
              className="px-3 py-1 border-2 border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-black"
            >
              NO_
            </button>
          </div>
        </div>
      )}

      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-black border border-gray-700 p-3 
                 text-gray-400 font-mono hover:bg-gray-900 hover:text-gray-300 transition-colors
                 shadow-lg"
      >
        {isOpen ? (
          <XMarkIcon className="h-5 w-5" />
        ) : (
          <div className="relative w-5 h-5">
            <Image
              src="/favicon.ico"
              alt="Winston AI"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
      </button>
    </>
  );
};

export default Chatbot; 