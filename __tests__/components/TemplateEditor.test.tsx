import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateEditor } from '../../components/TemplateEditor';
import { usePermissions } from '../../contexts/PermissionsContext';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('../../contexts/PermissionsContext');
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

// Mock data
const mockTemplate = {
  id: '1',
  name: 'Welcome Email',
  subject: 'Welcome to Our Platform',
  content: '<p>Hello {{firstName}},</p><p>Welcome to our platform!</p>',
  variables: ['firstName', 'companyName'],
  createdAt: '2024-03-15T10:00:00Z',
  updatedAt: '2024-03-15T10:00:00Z',
  teamId: '1',
  userId: '1',
};

describe('TemplateEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock permissions
    (usePermissions as jest.Mock).mockReturnValue({
      checkPermission: (permission: string) => {
        const permissions = {
          canEditTemplates: true,
          canDeleteTemplates: true,
          canShareTemplates: true,
          canManageVariables: true
        };
        return permissions[permission] ?? false;
      }
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ template: mockTemplate })
    });
  });

  it('renders without crashing', () => {
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={() => {}}
      />
    );
    expect(screen.getByTestId('template-editor')).toBeInTheDocument();
  });

  it('displays template content correctly', () => {
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={() => {}}
      />
    );

    expect(screen.getByDisplayValue('Welcome Email')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Welcome to Our Platform')).toBeInTheDocument();
  });

  it('handles template name changes', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={onSave}
      />
    );

    const nameInput = screen.getByLabelText(/Template Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Template Name');

    const saveButton = screen.getByText(/Save/i);
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated Template Name'
      })
    );
  });

  it('handles subject line changes', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={onSave}
      />
    );

    const subjectInput = screen.getByLabelText(/Subject Line/i);
    await user.clear(subjectInput);
    await user.type(subjectInput, 'Updated Subject Line');

    const saveButton = screen.getByText(/Save/i);
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Updated Subject Line'
      })
    );
  });

  it('handles variable insertion', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={() => {}}
      />
    );

    // Open variables menu
    const variablesButton = screen.getByText(/Insert Variable/i);
    await user.click(variablesButton);

    // Select a variable
    const firstNameVar = screen.getByText(/firstName/i);
    await user.click(firstNameVar);

    // Verify the variable was inserted
    expect(screen.getByText(/{{firstName}}/)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={onSave}
      />
    );

    // Clear required fields
    const nameInput = screen.getByLabelText(/Template Name/i);
    const subjectInput = screen.getByLabelText(/Subject Line/i);
    await user.clear(nameInput);
    await user.clear(subjectInput);

    // Try to save
    const saveButton = screen.getByText(/Save/i);
    await user.click(saveButton);

    // Verify validation messages
    expect(screen.getByText(/Template name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Subject line is required/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('handles preview mode', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={() => {}}
      />
    );

    // Toggle preview mode
    const previewButton = screen.getByText(/Preview/i);
    await user.click(previewButton);

    // Verify preview content
    expect(screen.getByTestId('preview-mode')).toBeInTheDocument();
    expect(screen.getByText(/Hello John/i)).toBeInTheDocument(); // Assuming preview data
  });

  it('handles template sharing', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={() => {}}
      />
    );

    // Open share dialog
    const shareButton = screen.getByText(/Share/i);
    await user.click(shareButton);

    // Add a user to share with
    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'user@example.com');

    // Set permissions
    const editCheckbox = screen.getByLabelText(/Can Edit/i);
    await user.click(editCheckbox);

    // Share the template
    const confirmButton = screen.getByText(/Share Template/i);
    await user.click(confirmButton);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/templates/1/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@example.com',
        permissions: ['edit']
      })
    });
  });

  it('handles template versioning', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={() => {}}
      />
    );

    // Open version history
    const versionsButton = screen.getByText(/Version History/i);
    await user.click(versionsButton);

    // Verify versions are displayed
    expect(screen.getByText(/Version 1/i)).toBeInTheDocument();
    
    // Restore a version
    const restoreButton = screen.getByText(/Restore/i);
    await user.click(restoreButton);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/templates/1/versions/1', {
      method: 'POST'
    });
  });

  it('handles error states', async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to save'));

    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={() => {}}
      />
    );

    // Try to save
    const saveButton = screen.getByText(/Save/i);
    await user.click(saveButton);

    // Verify error message
    expect(screen.getByText(/Failed to save/i)).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Failed to save template');
  });

  it('respects user permissions', () => {
    // Mock permissions to be false
    (usePermissions as jest.Mock).mockReturnValue({
      checkPermission: () => false
    });

    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={() => {}}
      />
    );

    // Share button should not be visible
    expect(screen.queryByText(/Share/i)).not.toBeInTheDocument();
    // Version history button should not be visible
    expect(screen.queryByText(/Version History/i)).not.toBeInTheDocument();
  });

  it('handles autosave functionality', async () => {
    jest.useFakeTimers();
    const onSave = jest.fn();
    const user = userEvent.setup();

    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={onSave}
        autoSave
      />
    );

    // Make changes
    const nameInput = screen.getByLabelText(/Template Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Autosaved Template');

    // Fast-forward timers
    jest.advanceTimersByTime(2000);

    // Verify autosave
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Autosaved Template'
      })
    );

    jest.useRealTimers();
  });

  it('handles template export', async () => {
    const user = userEvent.setup();
    render(
      <TemplateEditor
        template={mockTemplate}
        onSave={() => {}}
      />
    );

    // Click export button
    const exportButton = screen.getByText(/Export/i);
    await user.click(exportButton);

    // Select format
    const htmlOption = screen.getByText(/HTML/i);
    await user.click(htmlOption);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/templates/1/export?format=html', {
      method: 'GET'
    });
  });
}); 