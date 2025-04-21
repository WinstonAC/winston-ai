import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignCreator } from '../../components/CampaignCreator';

// Mock data
const mockTemplates = [
  { id: '1', name: 'Welcome Email', subject: 'Welcome!' },
  { id: '2', name: 'Follow-up Email', subject: 'Following up' },
];

const mockSegments = [
  { id: '1', name: 'All Leads' },
  { id: '2', name: 'New Leads' },
];

const mockLeads = [
  { id: '1', name: 'John Doe', email: 'john@example.com', company: 'Acme Inc', title: 'CEO' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', company: 'Tech Corp', title: 'CTO' },
];

// Mock functions
const mockOnCreateCampaign = jest.fn();
const mockOnUpdateCampaign = jest.fn();
const mockOnDeleteCampaign = jest.fn();

describe('CampaignCreator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(
      <CampaignCreator
        leads={mockLeads}
        templates={mockTemplates}
        segments={mockSegments}
        onCreateCampaign={mockOnCreateCampaign}
        onUpdateCampaign={mockOnUpdateCampaign}
        onDeleteCampaign={mockOnDeleteCampaign}
      />
    );

    expect(screen.getByText('EMAIL_CAMPAIGNS_')).toBeInTheDocument();
    expect(screen.getByText('CREATE_CAMPAIGN_')).toBeInTheDocument();
  });

  it('opens create campaign modal when create button is clicked', async () => {
    render(
      <CampaignCreator
        leads={mockLeads}
        templates={mockTemplates}
        segments={mockSegments}
        onCreateCampaign={mockOnCreateCampaign}
        onUpdateCampaign={mockOnUpdateCampaign}
        onDeleteCampaign={mockOnDeleteCampaign}
      />
    );

    const createButton = screen.getByText('CREATE_CAMPAIGN_');
    fireEvent.click(createButton);

    expect(screen.getByText('CREATE_NEW_CAMPAIGN_')).toBeInTheDocument();
    expect(screen.getByLabelText('CAMPAIGN_NAME_')).toBeInTheDocument();
    expect(screen.getByLabelText('DESCRIPTION_')).toBeInTheDocument();
  });

  it('validates required fields when creating a campaign', async () => {
    render(
      <CampaignCreator
        leads={mockLeads}
        templates={mockTemplates}
        segments={mockSegments}
        onCreateCampaign={mockOnCreateCampaign}
        onUpdateCampaign={mockOnUpdateCampaign}
        onDeleteCampaign={mockOnDeleteCampaign}
      />
    );

    // Open create modal
    fireEvent.click(screen.getByText('CREATE_CAMPAIGN_'));

    // Try to create without filling required fields
    const createButton = screen.getByText('CREATE_CAMPAIGN_', { selector: 'button' });
    fireEvent.click(createButton);

    // Check for validation messages
    expect(screen.getByText('Campaign name is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Please select an email template')).toBeInTheDocument();
    expect(screen.getByText('Please select a target segment')).toBeInTheDocument();
  });

  it('successfully creates a campaign with valid data', async () => {
    render(
      <CampaignCreator
        leads={mockLeads}
        templates={mockTemplates}
        segments={mockSegments}
        onCreateCampaign={mockOnCreateCampaign}
        onUpdateCampaign={mockOnUpdateCampaign}
        onDeleteCampaign={mockOnDeleteCampaign}
      />
    );

    // Open create modal
    fireEvent.click(screen.getByText('CREATE_CAMPAIGN_'));

    // Fill in the form
    await userEvent.type(screen.getByLabelText('CAMPAIGN_NAME_'), 'Test Campaign');
    await userEvent.type(screen.getByLabelText('DESCRIPTION_'), 'Test Description');
    
    // Select template and segment
    fireEvent.change(screen.getByLabelText('EMAIL_TEMPLATE_'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('TARGET_SEGMENT_'), { target: { value: '1' } });

    // Submit the form
    const createButton = screen.getByText('CREATE_CAMPAIGN_', { selector: 'button' });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockOnCreateCampaign).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Campaign',
        description: 'Test Description',
        templateId: '1',
        targetAudience: expect.objectContaining({
          segment: '1'
        })
      }));
    });
  });

  it('handles campaign deletion with confirmation', async () => {
    const mockCampaign = {
      id: '1',
      name: 'Test Campaign',
      description: 'Test Description',
      templateId: '1',
      targetAudience: { segment: '1', filters: {} },
      schedule: { type: 'immediate' },
      status: 'draft'
    };

    // Mock the fetchCampaigns response
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockCampaign])
      })
    );

    render(
      <CampaignCreator
        leads={mockLeads}
        templates={mockTemplates}
        segments={mockSegments}
        onCreateCampaign={mockOnCreateCampaign}
        onUpdateCampaign={mockOnUpdateCampaign}
        onDeleteCampaign={mockOnDeleteCampaign}
      />
    );

    // Wait for campaigns to load
    await waitFor(() => {
      expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Confirm deletion
    const confirmDeleteButton = screen.getByText('DELETE_');
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockOnDeleteCampaign).toHaveBeenCalledWith('1');
    });
  });
}); 