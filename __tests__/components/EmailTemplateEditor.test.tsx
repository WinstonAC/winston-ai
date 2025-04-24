import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import EmailTemplateEditor from '@/components/EmailTemplateEditor';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/lib/api');
jest.mock('react-hot-toast');
jest.mock('@tiptap/react', () => ({
  useEditor: () => ({
    commands: {
      setContent: jest.fn(),
      insertContent: jest.fn(),
    },
    getHTML: () => '<p>Test content</p>',
  }),
}));

describe('EmailTemplateEditor', () => {
  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin'
  };

  const mockTemplate = {
    id: '1',
    name: 'Sales Follow-up',
    subject: 'Following up on our conversation',
    content: 'Hi {{firstName}},\n\nI hope this email finds you well. I wanted to follow up on our conversation about {{company}}\'s needs.\n\nBest regards,\n{{senderName}}',
    variables: ['firstName', 'company', 'senderName'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: false
    });

    (api.previewTemplate as jest.Mock).mockResolvedValue({
      subject: 'Following up on our conversation',
      content: 'Hi John,\n\nI hope this email finds you well. I wanted to follow up on our conversation about Acme Corp\'s needs.\n\nBest regards,\nTest User'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the template editor interface', () => {
    render(<EmailTemplateEditor />);

    expect(screen.getByText('Email Template Editor')).toBeInTheDocument();
    expect(screen.getByLabelText('Template Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject Line')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Content')).toBeInTheDocument();
    expect(screen.getByText('Insert Variable')).toBeInTheDocument();
  });

  it('handles template name and subject input', async () => {
    const user = userEvent.setup();
    render(<EmailTemplateEditor />);

    await user.type(screen.getByLabelText('Template Name'), 'Test Template');
    await user.type(screen.getByLabelText('Subject Line'), 'Test Subject');

    expect(screen.getByLabelText('Template Name')).toHaveValue('Test Template');
    expect(screen.getByLabelText('Subject Line')).toHaveValue('Test Subject');
  });

  it('handles email content editing', async () => {
    const user = userEvent.setup();
    render(<EmailTemplateEditor />);

    const contentEditor = screen.getByLabelText('Email Content');
    await user.type(contentEditor, 'Hello {{firstName}},\n\nThis is a test email.');

    expect(contentEditor).toHaveValue('Hello {{firstName}},\n\nThis is a test email.');
  });

  it('handles variable insertion', async () => {
    const user = userEvent.setup();
    render(<EmailTemplateEditor />);

    // Open variable menu
    await user.click(screen.getByText('Insert Variable'));
    
    // Select a variable
    await user.click(screen.getByText('First Name'));

    const contentEditor = screen.getByLabelText('Email Content');
    expect(contentEditor).toHaveValue('{{firstName}}');
  });

  it('handles template preview', async () => {
    const user = userEvent.setup();
    render(<EmailTemplateEditor />);

    // Fill in template details
    await user.type(screen.getByLabelText('Template Name'), 'Test Template');
    await user.type(screen.getByLabelText('Subject Line'), 'Hello {{firstName}}');
    await user.type(screen.getByLabelText('Email Content'), 'Hi {{firstName}},\n\nWelcome to {{company}}!');

    // Click preview
    await user.click(screen.getByText('Preview'));

    await waitFor(() => {
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Hi John,')).toBeInTheDocument();
      expect(screen.getByText('Welcome to Acme Corp!')).toBeInTheDocument();
    });
  });

  it('handles saving templates', async () => {
    const user = userEvent.setup();
    (api.createTemplate as jest.Mock).mockResolvedValue({ id: '1' });

    render(<EmailTemplateEditor />);

    // Fill in template details
    await user.type(screen.getByLabelText('Template Name'), 'Test Template');
    await user.type(screen.getByLabelText('Subject Line'), 'Test Subject');
    await user.type(screen.getByLabelText('Email Content'), 'Test Content');

    // Save template
    await user.click(screen.getByText('Save Template'));

    expect(api.createTemplate).toHaveBeenCalledWith({
      name: 'Test Template',
      subject: 'Test Subject',
      content: 'Test Content'
    });

    expect(toast.success).toHaveBeenCalledWith('Template saved successfully');
  });

  it('handles editing existing templates', async () => {
    const user = userEvent.setup();
    render(<EmailTemplateEditor template={mockTemplate} />);

    // Verify existing data is loaded
    expect(screen.getByLabelText('Template Name')).toHaveValue('Sales Follow-up');
    expect(screen.getByLabelText('Subject Line')).toHaveValue('Following up on our conversation');
    expect(screen.getByLabelText('Email Content')).toHaveValue(mockTemplate.content);

    // Edit template
    await user.clear(screen.getByLabelText('Template Name'));
    await user.type(screen.getByLabelText('Template Name'), 'Updated Template');
    await user.click(screen.getByText('Save Template'));

    expect(api.updateTemplate).toHaveBeenCalledWith('1', expect.objectContaining({
      name: 'Updated Template'
    }));
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<EmailTemplateEditor />);

    // Try to save without required fields
    await user.click(screen.getByText('Save Template'));

    expect(screen.getByText('Template name is required')).toBeInTheDocument();
    expect(screen.getByText('Subject line is required')).toBeInTheDocument();
    expect(screen.getByText('Email content is required')).toBeInTheDocument();
  });

  it('handles variable validation', async () => {
    const user = userEvent.setup();
    render(<EmailTemplateEditor />);

    // Add invalid variable syntax
    await user.type(screen.getByLabelText('Email Content'), 'Hello {firstName}');
    await user.click(screen.getByText('Save Template'));

    expect(screen.getByText('Invalid variable syntax: {firstName}')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: true
    });

    render(<EmailTemplateEditor />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles preview loading and error states', async () => {
    const user = userEvent.setup();
    (api.previewTemplate as jest.Mock).mockRejectedValueOnce(new Error('Preview failed'));

    render(<EmailTemplateEditor />);

    // Fill in template details
    await user.type(screen.getByLabelText('Template Name'), 'Test Template');
    await user.type(screen.getByLabelText('Subject Line'), 'Test Subject');
    await user.type(screen.getByLabelText('Email Content'), 'Test Content');

    // Click preview
    await user.click(screen.getByText('Preview'));

    await waitFor(() => {
      expect(screen.getByText('Error loading preview')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('handles rich text editing', async () => {
    const user = userEvent.setup();
    render(<EmailTemplateEditor />);

    // Test bold text
    await user.click(screen.getByTitle('Bold'));
    await user.type(screen.getByLabelText('Email Content'), 'Bold text');
    expect(screen.getByLabelText('Email Content')).toHaveValue('**Bold text**');

    // Test italic text
    await user.click(screen.getByTitle('Italic'));
    await user.type(screen.getByLabelText('Email Content'), 'Italic text');
    expect(screen.getByLabelText('Email Content')).toHaveValue('*Italic text*');

    // Test links
    await user.click(screen.getByTitle('Link'));
    await user.type(screen.getByLabelText('URL'), 'https://example.com');
    await user.type(screen.getByLabelText('Link Text'), 'Click here');
    await user.click(screen.getByText('Insert Link'));
    expect(screen.getByLabelText('Email Content')).toHaveValue('[Click here](https://example.com)');
  });

  it('handles template versioning', async () => {
    const user = userEvent.setup();
    render(<EmailTemplateEditor template={mockTemplate} />);

    // Make changes
    await user.clear(screen.getByLabelText('Email Content'));
    await user.type(screen.getByLabelText('Email Content'), 'Updated content');

    // Save as new version
    await user.click(screen.getByText('Save as New Version'));

    expect(api.createTemplateVersion).toHaveBeenCalledWith('1', expect.objectContaining({
      content: 'Updated content'
    }));

    // View version history
    await user.click(screen.getByText('Version History'));
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Version 2')).toBeInTheDocument();

    // Restore previous version
    await user.click(screen.getByText('Restore Version 1'));
    expect(screen.getByLabelText('Email Content')).toHaveValue(mockTemplate.content);
  });

  it('handles personalization preview', async () => {
    const user = userEvent.setup();
    render(<EmailTemplateEditor />);

    // Fill in template
    await user.type(screen.getByLabelText('Email Content'), 'Hi {{firstName}},\n\nWelcome to {{company}}!');

    // Open personalization preview
    await user.click(screen.getByText('Preview Personalization'));

    // Select lead for preview
    await user.click(screen.getByText('Select Lead'));
    await user.click(screen.getByText('John Doe - Acme Corp'));

    await waitFor(() => {
      expect(screen.getByText('Hi John,')).toBeInTheDocument();
      expect(screen.getByText('Welcome to Acme Corp!')).toBeInTheDocument();
    });
  });
}); 