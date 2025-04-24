import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatbotInteraction } from '../../components/ChatbotInteraction';
import { usePermissions } from '../../contexts/PermissionsContext';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('../../contexts/PermissionsContext');
jest.mock('react-hot-toast');
jest.mock('../../hooks/useWebSocket');

// Mock data
const mockMessages = [
  {
    id: '1',
    content: 'Hello! How can I help you today?',
    role: 'assistant',
    timestamp: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    content: 'I need help with email templates',
    role: 'user',
    timestamp: '2024-03-15T10:01:00Z'
  },
  {
    id: '3',
    content: 'I can help you create and manage email templates. What specific aspect would you like to know about?',
    role: 'assistant',
    timestamp: '2024-03-15T10:01:30Z'
  }
];

const mockSuggestions = [
  'How do I create a new campaign?',
  'Show me my analytics',
  'Help me with lead segmentation'
];

describe('ChatbotInteraction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock permissions
    (usePermissions as jest.Mock).mockReturnValue({
      checkPermission: (permission: string) => {
        const permissions = {
          canUseChatbot: true,
          canExportChat: true,
          canClearHistory: true
        };
        return permissions[permission] ?? false;
      }
    });

    // Mock fetch for message history
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: mockMessages })
    });
  });

  it('renders without crashing', () => {
    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
      />
    );
    expect(screen.getByTestId('chatbot-interaction')).toBeInTheDocument();
  });

  it('displays message history correctly', () => {
    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
      />
    );

    mockMessages.forEach(message => {
      expect(screen.getByText(message.content)).toBeInTheDocument();
    });
  });

  it('handles user input submission', async () => {
    const user = userEvent.setup();
    const onSendMessage = jest.fn();
    
    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
        onSendMessage={onSendMessage}
      />
    );

    // Type a message
    const input = screen.getByPlaceholderText(/Type your message/i);
    await user.type(input, 'How do I export my data?');

    // Send message
    const sendButton = screen.getByTitle(/Send message/i);
    await user.click(sendButton);

    // Verify message was sent
    expect(onSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'How do I export my data?',
        role: 'user'
      })
    );
  });

  it('shows typing indicator while AI is responding', async () => {
    const user = userEvent.setup();
    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
        isAiTyping={true}
      />
    );

    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });

  it('handles suggestion clicks', async () => {
    const user = userEvent.setup();
    const onSendMessage = jest.fn();
    
    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
        onSendMessage={onSendMessage}
      />
    );

    // Click a suggestion
    const suggestion = screen.getByText(mockSuggestions[0]);
    await user.click(suggestion);

    // Verify suggestion was sent as message
    expect(onSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: mockSuggestions[0],
        role: 'user'
      })
    );
  });

  it('handles message reactions', async () => {
    const user = userEvent.setup();
    const onReaction = jest.fn();
    
    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
        onReaction={onReaction}
      />
    );

    // Find and click thumbs up button
    const thumbsUpButton = screen.getAllByTitle(/thumbs up/i)[0];
    await user.click(thumbsUpButton);

    // Verify reaction was recorded
    expect(onReaction).toHaveBeenCalledWith('1', 'thumbsUp');
  });

  it('allows message copy to clipboard', async () => {
    const user = userEvent.setup();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    
    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
      />
    );

    // Find and click copy button
    const copyButton = screen.getAllByTitle(/Copy message/i)[0];
    await user.click(copyButton);

    // Verify message was copied
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockMessages[0].content);
    expect(toast.success).toHaveBeenCalledWith('Message copied to clipboard');
  });

  it('handles chat export', async () => {
    const user = userEvent.setup();
    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
      />
    );

    // Click export button
    const exportButton = screen.getByText(/Export Chat/i);
    await user.click(exportButton);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/chat/export', {
      method: 'GET'
    });
  });

  it('handles error states', async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to send message'));

    const user = userEvent.setup();
    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
      />
    );

    // Type and send a message
    const input = screen.getByPlaceholderText(/Type your message/i);
    await user.type(input, 'Test message');
    const sendButton = screen.getByTitle(/Send message/i);
    await user.click(sendButton);

    // Verify error message
    expect(screen.getByText(/Failed to send message/i)).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Failed to send message');
  });

  it('respects user permissions', () => {
    // Mock permissions to be false
    (usePermissions as jest.Mock).mockReturnValue({
      checkPermission: () => false
    });

    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
      />
    );

    // Export button should not be visible
    expect(screen.queryByText(/Export Chat/i)).not.toBeInTheDocument();
    // Clear history button should not be visible
    expect(screen.queryByText(/Clear History/i)).not.toBeInTheDocument();
  });

  it('handles message streaming', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue('This is ');
        controller.enqueue('a streaming ');
        controller.enqueue('response.');
        controller.close();
      }
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: mockStream,
      headers: new Headers({ 'Content-Type': 'text/event-stream' })
    });

    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
        streamingEnabled={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('This is a streaming response.')).toBeInTheDocument();
    });
  });

  it('handles chat history clearing', async () => {
    const user = userEvent.setup();
    const onClearHistory = jest.fn();
    
    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
        onClearHistory={onClearHistory}
      />
    );

    // Click clear history button
    const clearButton = screen.getByText(/Clear History/i);
    await user.click(clearButton);

    // Confirm clear
    const confirmButton = screen.getByText(/Confirm/i);
    await user.click(confirmButton);

    // Verify history was cleared
    expect(onClearHistory).toHaveBeenCalled();
    expect(screen.queryByText(mockMessages[0].content)).not.toBeInTheDocument();
  });

  it('handles file attachments', async () => {
    const user = userEvent.setup();
    const onAttachment = jest.fn();
    
    render(
      <ChatbotInteraction
        initialMessages={mockMessages}
        suggestions={mockSuggestions}
        onAttachment={onAttachment}
      />
    );

    // Upload a file
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, file);

    // Verify file was processed
    expect(onAttachment).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test.txt',
        type: 'text/plain'
      })
    );
  });

  it('handles code snippets', async () => {
    const messageWithCode = {
      id: '4',
      content: '```javascript\nconst hello = "world";\nconsole.log(hello);\n```',
      role: 'assistant',
      timestamp: '2024-03-15T10:02:00Z'
    };

    render(
      <ChatbotInteraction
        initialMessages={[...mockMessages, messageWithCode]}
        suggestions={mockSuggestions}
      />
    );

    // Verify code block is rendered with syntax highlighting
    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toHaveClass('language-javascript');
    expect(codeBlock).toHaveTextContent('const hello = "world";');
  });
}); 