import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';
import { usePermissions } from '../../contexts/PermissionsContext';
import { toast } from 'react-hot-toast';
import { Chart } from 'chart.js';
import { CampaignMetrics, AnalyticsData, DataAccessLevel } from '@/types/analytics';

// Mock the dependencies
jest.mock('../../contexts/PermissionsContext');
jest.mock('react-hot-toast');
jest.mock('chart.js');
jest.mock('react-chartjs-2');

// Mock data
const mockCampaigns: CampaignMetrics[] = [
  {
    id: '1',
    name: 'Test Campaign 1',
    sent: 1000,
    delivered: 950,
    opened: 500,
    clicked: 200,
    bounced: 50,
    replies: 75,
    meetings: 10,
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  },
  {
    id: '2',
    name: 'Test Campaign 2',
    sent: 2000,
    delivered: 1900,
    opened: 1000,
    clicked: 400,
    bounced: 100,
    replies: 150,
    meetings: 20,
    startDate: '2024-02-01',
    endDate: '2024-02-28'
  }
];

const mockAnalyticsData: AnalyticsData = {
  totalLeads: 500,
  openRate: 45.5,
  responseRate: 15.2,
  meetings: 30,
  recentActivity: [
    {
      id: '1',
      type: 'email_opened',
      leadName: 'John Doe',
      createdAt: '2024-03-15T10:00:00Z'
    }
  ],
  trends: [
    {
      date: '2024-03-15',
      opens: 100,
      clicks: 50,
      responses: 20
    }
  ]
};

const defaultProps = {
  campaigns: mockCampaigns,
  initialDateRange: { start: new Date('2024-01-01'), end: new Date('2024-03-15') },
  onDateRangeChange: jest.fn(),
  user: { id: '1', email: 'test@example.com' },
  dataAccessLevel: 'team' as DataAccessLevel
};

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock permissions
    (usePermissions as jest.Mock).mockReturnValue({
      checkPermission: (permission: string) => {
        const permissions = {
          canExportData: true,
          canCompareCampaigns: true,
          canManageAnnotations: true,
          canAccessAdvancedCharts: true
        };
        return permissions[permission] ?? false;
      }
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAnalyticsData)
    });

    // Mock window.ResizeObserver
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<AnalyticsDashboard {...defaultProps} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays campaign metrics correctly', async () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Campaign 1')).toBeInTheDocument();
      expect(screen.getByText('Test Campaign 2')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument(); // sent count
      expect(screen.getByText('52.6%')).toBeInTheDocument(); // open rate
      expect(screen.getByText('15.2%')).toBeInTheDocument(); // response rate
    });
  });

  it('handles date range changes', async () => {
    const onDateRangeChange = jest.fn();
    render(<AnalyticsDashboard {...defaultProps} onDateRangeChange={onDateRangeChange} />);

    const startDatePicker = screen.getByTestId('date-range-start');
    const endDatePicker = screen.getByTestId('date-range-end');

    await userEvent.type(startDatePicker, '2024-02-01');
    await userEvent.type(endDatePicker, '2024-02-28');

    await waitFor(() => {
      expect(onDateRangeChange).toHaveBeenCalledWith({
        start: new Date('2024-02-01'),
        end: new Date('2024-02-28')
      });
    });
  });

  it('handles campaign comparison', async () => {
    const onCompare = jest.fn();
    render(<AnalyticsDashboard {...defaultProps} onCompare={onCompare} />);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox', { name: /select campaign/i });
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
    });

    const compareButton = screen.getByRole('button', { name: /compare selected/i });
    fireEvent.click(compareButton);

    expect(onCompare).toHaveBeenCalledWith(['1', '2']);
  });

  it('handles data export with different formats', async () => {
    render(<AnalyticsDashboard {...defaultProps} />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    const exportOptions = screen.getByTestId('export-options');
    expect(exportOptions).toBeInTheDocument();

    // Test CSV export
    const csvExport = screen.getByRole('button', { name: /export as csv/i });
    fireEvent.click(csvExport);
    expect(toast.success).toHaveBeenCalledWith('Export started');

    // Test PDF export
    const pdfExport = screen.getByRole('button', { name: /export as pdf/i });
    fireEvent.click(pdfExport);
    expect(toast.success).toHaveBeenCalledWith('Export started');
  });

  it('handles error states gracefully', async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

    render(<AnalyticsDashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/error loading analytics/i)).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Failed to load analytics data');
    });
  });

  it('respects user permissions', async () => {
    // Mock permissions to deny export
    (usePermissions as jest.Mock).mockReturnValue({
      checkPermission: (permission: string) => permission !== 'canExportData'
    });

    render(<AnalyticsDashboard {...defaultProps} />);

    await waitFor(() => {
      const exportButton = screen.queryByRole('button', { name: /export/i });
      expect(exportButton).not.toBeInTheDocument();
    });
  });

  it('handles offline mode', async () => {
    // Simulate offline mode
    const originalOnline = window.navigator.onLine;
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      writable: true
    });

    render(<AnalyticsDashboard {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/offline mode/i)).toBeInTheDocument();
      expect(screen.getByText(/using cached data/i)).toBeInTheDocument();
    });

    // Restore online status
    Object.defineProperty(window.navigator, 'onLine', {
      value: originalOnline,
      writable: true
    });
  });

  it('updates in real-time when new data arrives', async () => {
    const { rerender } = render(<AnalyticsDashboard {...defaultProps} />);

    // Simulate new data arriving
    const updatedCampaigns = [...mockCampaigns];
    updatedCampaigns[0].meetings = 15; // Increase meetings

    rerender(<AnalyticsDashboard {...defaultProps} campaigns={updatedCampaigns} />);

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // Updated meetings count
    });
  });
}); 