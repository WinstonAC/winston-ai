import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import Chatbot from '@/components/Chatbot';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/lib/api');
jest.mock('react-hot-toast');

// Mock WebSocket
class MockWebSocket {
  onopen: () => void = () => {};
  onmessage: (event: any) => void = () => {};
  onclose: () => void = () => {};
  onerror: () => void = () => {};
  send = jest.fn();
  close = jest.fn();

  constructor() {
    setTimeout(() => this.onopen(), 0);
  }
}

// @ts-ignore
global.WebSocket = MockWebSocket;

describe('Chatbot', () => {
  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin'
  };

  const mockMessages = [
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      role: 'assistant',
      timestamp: '2024-03-20T10:00:00Z'
    },
    {
      id: '2',
      content: 'I need help with email templates',
      role: 'user',
      timestamp: '2024-03-20T10:01:00Z'
    }
  ];

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: false
    });

    (api.getChatHistory as jest.Mock).mockResolvedValue(mockMessages);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the chatbot interface', async () => {
    render(<Chatbot />);
    
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /message input/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });
  });

  it('loads chat history', async () => {
    render(<Chatbot />);

    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
      expect(screen.getByText('I need help with email templates')).toBeInTheDocument();
    });
  });

  it('sends messages', async () => {
    const user = userEvent.setup();
    const mockWs = new MockWebSocket();
    render(<Chatbot />);

    // Type and send message
    const input = screen.getByRole('textbox', { name: /message input/i });
    await user.type(input, 'How do I create a new campaign?');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
      type: 'message',
      content: 'How do I create a new campaign?'
    }));

    // Simulate response
    mockWs.onmessage({
      data: JSON.stringify({
        type: 'message',
        content: 'To create a new campaign, go to the Campaigns page and click the "New Campaign" button.',
        role: 'assistant'
      })
    });

    await waitFor(() => {
      expect(screen.getByText('To create a new campaign, go to the Campaigns page and click the "New Campaign" button.')).toBeInTheDocument();
    });
  });

  it('handles WebSocket connection errors', async () => {
    const mockWs = new MockWebSocket();
    render(<Chatbot />);

    // Simulate connection error
    mockWs.onerror();

    await waitFor(() => {
      expect(screen.getByText(/connection error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reconnect/i })).toBeInTheDocument();
    });

    // Test reconnection
    await userEvent.click(screen.getByRole('button', { name: /reconnect/i }));
    expect(screen.queryByText(/connection error/i)).not.toBeInTheDocument();
  });

  it('handles message typing indicators', async () => {
    const mockWs = new MockWebSocket();
    render(<Chatbot />);

    // Simulate typing indicator
    mockWs.onmessage({
      data: JSON.stringify({
        type: 'typing',
        isTyping: true
      })
    });

    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();

    // Simulate typing end
    mockWs.onmessage({
      data: JSON.stringify({
        type: 'typing',
        isTyping: false
      })
    });

    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
  });

  it('handles file uploads', async () => {
    const user = userEvent.setup();
    const mockWs = new MockWebSocket();
    const mockFileUrl = 'https://example.com/file.pdf';
    (api.uploadFile as jest.Mock).mockResolvedValue({ url: mockFileUrl });

    render(<Chatbot />);

    // Upload file
    const file = new File(['test file'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('file-upload');
    await user.upload(input, file);

    await waitFor(() => {
      expect(api.uploadFile).toHaveBeenCalled();
      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'file',
        url: mockFileUrl
      }));
    });
  });

  it('handles message reactions', async () => {
    const user = userEvent.setup();
    render(<Chatbot />);

    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    });

    // React to message
    await user.click(screen.getByTestId('message-reaction-1'));
    await user.click(screen.getByRole('button', { name: /👍/i }));

    expect(api.addMessageReaction).toHaveBeenCalledWith('1', '👍');
  });

  it('handles message context menu', async () => {
    const user = userEvent.setup();
    render(<Chatbot />);

    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    });

    // Open context menu
    await user.click(screen.getByTestId('message-menu-1'));

    expect(screen.getByRole('menuitem', { name: /copy/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /report/i })).toBeInTheDocument();

    // Copy message
    await user.click(screen.getByRole('menuitem', { name: /copy/i }));
    expect(toast.success).toHaveBeenCalledWith('Message copied to clipboard');
  });

  it('handles offline mode', async () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true
    });

    render(<Chatbot />);

    expect(screen.getByText(/you are offline/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument();

    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true
    });

    fireEvent(window, new Event('online'));

    await waitFor(() => {
      expect(screen.queryByText(/you are offline/i)).not.toBeInTheDocument();
    });
  });

  it('handles message search', async () => {
    const user = userEvent.setup();
    (api.searchMessages as jest.Mock).mockResolvedValue([mockMessages[0]]);

    render(<Chatbot />);

    // Open search
    await user.click(screen.getByRole('button', { name: /search/i }));
    
    // Search for message
    const searchInput = screen.getByRole('textbox', { name: /search messages/i });
    await user.type(searchInput, 'help');
    
    await waitFor(() => {
      expect(api.searchMessages).toHaveBeenCalledWith('help');
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    });
  });

  it('handles message suggestions', async () => {
    render(<Chatbot />);

    // Check for suggestions
    expect(screen.getByText(/suggested responses/i)).toBeInTheDocument();
    const suggestions = screen.getAllByTestId('message-suggestion');
    expect(suggestions).toHaveLength(3);

    // Click suggestion
    await userEvent.click(suggestions[0]);
    expect(screen.getByRole('textbox', { name: /message input/i })).toHaveValue(suggestions[0].textContent);
  });
}); 