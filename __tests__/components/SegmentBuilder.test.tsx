import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import SegmentBuilder from '@/components/SegmentBuilder';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/lib/api');
jest.mock('react-hot-toast');

describe('SegmentBuilder', () => {
  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin'
  };

  const mockSegment = {
    id: '1',
    name: 'High Value Prospects',
    description: 'Leads with high engagement scores',
    conditions: [
      {
        field: 'score',
        operator: 'greaterThan',
        value: 80
      },
      {
        field: 'lastContact',
        operator: 'withinLast',
        value: 30,
        unit: 'days'
      }
    ],
    matchType: 'all',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: false
    });

    (api.getSegmentPreview as jest.Mock).mockResolvedValue({
      count: 150,
      sampleLeads: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          score: 85
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          score: 92
        }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the segment builder interface', () => {
    render(<SegmentBuilder />);

    expect(screen.getByText('Segment Builder')).toBeInTheDocument();
    expect(screen.getByLabelText('Segment Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Match Type')).toBeInTheDocument();
    expect(screen.getByText('Add Condition')).toBeInTheDocument();
  });

  it('handles segment name and description input', async () => {
    const user = userEvent.setup();
    render(<SegmentBuilder />);

    await user.type(screen.getByLabelText('Segment Name'), 'Test Segment');
    await user.type(screen.getByLabelText('Description'), 'Test Description');

    expect(screen.getByLabelText('Segment Name')).toHaveValue('Test Segment');
    expect(screen.getByLabelText('Description')).toHaveValue('Test Description');
  });

  it('handles match type selection', async () => {
    const user = userEvent.setup();
    render(<SegmentBuilder />);

    await user.click(screen.getByText('Match Type'));
    await user.click(screen.getByText('Match Any'));

    expect(screen.getByText('Match Any')).toBeInTheDocument();
  });

  it('handles adding conditions', async () => {
    const user = userEvent.setup();
    render(<SegmentBuilder />);

    // Add first condition
    await user.click(screen.getByText('Add Condition'));
    await user.click(screen.getByText('Select Field'));
    await user.click(screen.getByText('Score'));
    await user.click(screen.getByText('Select Operator'));
    await user.click(screen.getByText('Greater Than'));
    await user.type(screen.getByLabelText('Value'), '80');

    // Add second condition
    await user.click(screen.getByText('Add Condition'));
    await user.click(screen.getAllByText('Select Field')[1]);
    await user.click(screen.getByText('Last Contact'));
    await user.click(screen.getAllByText('Select Operator')[1]);
    await user.click(screen.getByText('Within Last'));
    await user.type(screen.getByLabelText('Value'), '30');
    await user.click(screen.getByText('Select Unit'));
    await user.click(screen.getByText('Days'));

    expect(screen.getAllByTestId('condition-row')).toHaveLength(2);
  });

  it('handles removing conditions', async () => {
    const user = userEvent.setup();
    render(<SegmentBuilder />);

    // Add condition
    await user.click(screen.getByText('Add Condition'));
    expect(screen.getAllByTestId('condition-row')).toHaveLength(1);

    // Remove condition
    await user.click(screen.getByTestId('remove-condition-0'));
    expect(screen.queryByTestId('condition-row')).not.toBeInTheDocument();
  });

  it('handles segment preview', async () => {
    const user = userEvent.setup();
    render(<SegmentBuilder />);

    // Add condition
    await user.click(screen.getByText('Add Condition'));
    await user.click(screen.getByText('Select Field'));
    await user.click(screen.getByText('Score'));
    await user.click(screen.getByText('Select Operator'));
    await user.click(screen.getByText('Greater Than'));
    await user.type(screen.getByLabelText('Value'), '80');

    // Click preview
    await user.click(screen.getByText('Preview Results'));

    await waitFor(() => {
      expect(screen.getByText('150 leads match this segment')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('handles saving segments', async () => {
    const user = userEvent.setup();
    (api.createSegment as jest.Mock).mockResolvedValue({ id: '1' });

    render(<SegmentBuilder />);

    // Fill in segment details
    await user.type(screen.getByLabelText('Segment Name'), 'Test Segment');
    await user.type(screen.getByLabelText('Description'), 'Test Description');

    // Add condition
    await user.click(screen.getByText('Add Condition'));
    await user.click(screen.getByText('Select Field'));
    await user.click(screen.getByText('Score'));
    await user.click(screen.getByText('Select Operator'));
    await user.click(screen.getByText('Greater Than'));
    await user.type(screen.getByLabelText('Value'), '80');

    // Save segment
    await user.click(screen.getByText('Save Segment'));

    expect(api.createSegment).toHaveBeenCalledWith({
      name: 'Test Segment',
      description: 'Test Description',
      conditions: [
        {
          field: 'score',
          operator: 'greaterThan',
          value: 80
        }
      ],
      matchType: 'all'
    });

    expect(toast.success).toHaveBeenCalledWith('Segment saved successfully');
  });

  it('handles editing existing segments', async () => {
    const user = userEvent.setup();
    render(<SegmentBuilder segment={mockSegment} />);

    // Verify existing data is loaded
    expect(screen.getByLabelText('Segment Name')).toHaveValue('High Value Prospects');
    expect(screen.getByLabelText('Description')).toHaveValue('Leads with high engagement scores');
    expect(screen.getAllByTestId('condition-row')).toHaveLength(2);

    // Edit segment
    await user.clear(screen.getByLabelText('Segment Name'));
    await user.type(screen.getByLabelText('Segment Name'), 'Updated Segment');
    await user.click(screen.getByText('Save Segment'));

    expect(api.updateSegment).toHaveBeenCalledWith('1', expect.objectContaining({
      name: 'Updated Segment'
    }));
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<SegmentBuilder />);

    // Try to save without required fields
    await user.click(screen.getByText('Save Segment'));

    expect(screen.getByText('Segment name is required')).toBeInTheDocument();
    expect(screen.getByText('At least one condition is required')).toBeInTheDocument();
  });

  it('handles condition validation', async () => {
    const user = userEvent.setup();
    render(<SegmentBuilder />);

    // Add incomplete condition
    await user.click(screen.getByText('Add Condition'));
    await user.click(screen.getByText('Select Field'));
    await user.click(screen.getByText('Score'));

    // Try to save
    await user.click(screen.getByText('Save Segment'));

    expect(screen.getByText('Operator is required')).toBeInTheDocument();
    expect(screen.getByText('Value is required')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: true
    });

    render(<SegmentBuilder />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles preview loading and error states', async () => {
    const user = userEvent.setup();
    (api.getSegmentPreview as jest.Mock).mockRejectedValueOnce(new Error('Preview failed'));

    render(<SegmentBuilder />);

    // Add condition
    await user.click(screen.getByText('Add Condition'));
    await user.click(screen.getByText('Select Field'));
    await user.click(screen.getByText('Score'));
    await user.click(screen.getByText('Select Operator'));
    await user.click(screen.getByText('Greater Than'));
    await user.type(screen.getByLabelText('Value'), '80');

    // Click preview
    await user.click(screen.getByText('Preview Results'));

    await waitFor(() => {
      expect(screen.getByText('Error loading preview')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('handles complex conditions with nested groups', async () => {
    const user = userEvent.setup();
    render(<SegmentBuilder />);

    // Add condition group
    await user.click(screen.getByText('Add Group'));
    await user.click(screen.getByText('Match Any'));

    // Add conditions within group
    await user.click(screen.getAllByText('Add Condition')[1]);
    await user.click(screen.getAllByText('Select Field')[0]);
    await user.click(screen.getByText('Industry'));
    await user.click(screen.getAllByText('Select Operator')[0]);
    await user.click(screen.getByText('Equals'));
    await user.type(screen.getAllByLabelText('Value')[0], 'Technology');

    await user.click(screen.getAllByText('Add Condition')[1]);
    await user.click(screen.getAllByText('Select Field')[1]);
    await user.click(screen.getByText('Company Size'));
    await user.click(screen.getAllByText('Select Operator')[1]);
    await user.click(screen.getByText('Greater Than'));
    await user.type(screen.getAllByLabelText('Value')[1], '100');

    expect(screen.getAllByTestId('condition-group')).toHaveLength(1);
    expect(screen.getAllByTestId('condition-row')).toHaveLength(2);
  });
}); 