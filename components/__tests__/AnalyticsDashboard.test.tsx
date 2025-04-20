import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AnalyticsDashboard from '../AnalyticsDashboard';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { mockCampaigns } from '../../mocks/campaigns';

// Mock the date picker inputs
jest.mock('react-datepicker', () => {
  return {
    __esModule: true,
    default: ({ value, onChange }: any) => (
      <input
        data-testid="date-picker"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
  };
});

// Mock chart components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

describe('AnalyticsDashboard', () => {
  const mockCampaigns = [
    {
      id: '1',
      name: 'Test Campaign 1',
      sent: 1000,
      delivered: 950,
      opened: 500,
      clicked: 200,
      bounced: 50,
      replies: 100,
      meetings: 20,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    },
    {
      id: '2',
      name: 'Test Campaign 2',
      sent: 2000,
      delivered: 1900,
      opened: 1000,
      clicked: 400,
      bounced: 100,
      replies: 200,
      meetings: 40,
      startDate: '2024-02-01',
      endDate: '2024-02-29',
    },
  ];

  const mockDateRange = {
    start: '2024-01-01',
    end: '2024-02-29',
  };

  const mockOnDateRangeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    render(
      <AnalyticsDashboard
        campaigns={[]}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders all metric cards with correct values', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    await waitFor(() => {
      // Check metric cards
      expect(screen.getByText('Total Emails Sent')).toBeInTheDocument();
      expect(screen.getByText('3000')).toBeInTheDocument(); // Total sent
      expect(screen.getByText('Open Rate')).toBeInTheDocument();
      expect(screen.getByText('52.6%')).toBeInTheDocument(); // (1500/2850) * 100
      expect(screen.getByText('Reply Rate')).toBeInTheDocument();
      expect(screen.getByText('10.5%')).toBeInTheDocument(); // (300/2850) * 100
      expect(screen.getByText('Meeting Rate')).toBeInTheDocument();
      expect(screen.getByText('20.0%')).toBeInTheDocument(); // (60/300) * 100
    });
  });

  it('renders campaign performance table correctly', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    await waitFor(() => {
      // Check table headers
      expect(screen.getByText('Campaign')).toBeInTheDocument();
      expect(screen.getByText('Sent')).toBeInTheDocument();
      expect(screen.getByText('Open Rate')).toBeInTheDocument();
      expect(screen.getByText('Click Rate')).toBeInTheDocument();
      expect(screen.getByText('Reply Rate')).toBeInTheDocument();
      expect(screen.getByText('Meetings')).toBeInTheDocument();

      // Check campaign data
      expect(screen.getByText('Test Campaign 1')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('52.6%')).toBeInTheDocument(); // (500/950) * 100
      expect(screen.getByText('40.0%')).toBeInTheDocument(); // (200/500) * 100
      expect(screen.getByText('10.5%')).toBeInTheDocument(); // (100/950) * 100
      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });

  it('handles date range changes correctly', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    const startDateInput = screen.getAllByTestId('date-picker')[0];
    const endDateInput = screen.getAllByTestId('date-picker')[1];

    fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2024-02-15' } });

    expect(mockOnDateRangeChange).toHaveBeenCalledTimes(2);
    expect(mockOnDateRangeChange).toHaveBeenCalledWith('2024-01-15', mockDateRange.end);
    expect(mockOnDateRangeChange).toHaveBeenCalledWith(mockDateRange.start, '2024-02-15');
  });

  it('applies brutalist styling correctly', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    await waitFor(() => {
      // Check background color
      const container = screen.getByTestId('analytics-dashboard');
      expect(container).toHaveClass('bg-black');

      // Check border styling
      const metricCards = screen.getAllByTestId('metric-card');
      metricCards.forEach(card => {
        expect(card).toHaveClass('border-2');
        expect(card).toHaveClass('border-white');
      });

      // Check text colors
      const headings = screen.getAllByRole('heading');
      headings.forEach(heading => {
        expect(heading).toHaveClass('text-white');
      });

      // Check table styling
      const table = screen.getByRole('table');
      expect(table).toHaveClass('border-2');
      expect(table).toHaveClass('border-white');
    });
  });

  it('shows trend indicators correctly', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    await waitFor(() => {
      // Check positive trend
      const positiveTrend = screen.getByText('+5%');
      expect(positiveTrend).toHaveClass('text-green-500');

      // Check negative trend
      const negativeTrend = screen.getByText('-1.2%');
      expect(negativeTrend).toHaveClass('text-red-500');
    });
  });

  it('handles real-time updates correctly', async () => {
    const mockWebSocket = {
      onmessage: jest.fn(),
      close: jest.fn(),
    };
    global.WebSocket = jest.fn(() => mockWebSocket as any);

    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    await waitFor(() => {
      expect(global.WebSocket).toHaveBeenCalledWith('wss://your-websocket-endpoint');
    });

    // Simulate WebSocket message
    const mockData = {
      type: 'metrics_update',
      data: {
        campaignId: '1',
        metrics: {
          sent: 1100,
          delivered: 1000,
          opened: 600,
        },
      },
    };

    mockWebSocket.onmessage({ data: JSON.stringify(mockData) });

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });

  it('handles export functionality correctly', async () => {
    const mockOnExport = jest.fn();
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
        onExport={mockOnExport}
      />
    );

    // Open export menu
    fireEvent.click(screen.getByText('Export'));
    
    // Export as CSV
    fireEvent.click(screen.getByText('Export as CSV'));
    expect(mockOnExport).toHaveBeenCalledWith('csv');

    // Export as PDF
    fireEvent.click(screen.getByText('Export as PDF'));
    expect(mockOnExport).toHaveBeenCalledWith('pdf');
  });

  it('handles campaign comparison correctly', async () => {
    const mockOnCompare = jest.fn();
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
        onCompare={mockOnCompare}
      />
    );

    // Select campaigns
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Select first campaign
    fireEvent.click(checkboxes[1]); // Select second campaign

    // Click compare button
    fireEvent.click(screen.getByText('Compare'));
    expect(mockOnCompare).toHaveBeenCalledWith(['1', '2']);
  });

  it('disables compare button when less than 2 campaigns are selected', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    const compareButton = screen.getByText('Compare');
    expect(compareButton).toBeDisabled();

    // Select one campaign
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(compareButton).toBeDisabled();

    // Select second campaign
    fireEvent.click(checkboxes[1]);
    expect(compareButton).not.toBeDisabled();
  });

  it('handles empty campaign data gracefully', async () => {
    render(
      <AnalyticsDashboard
        campaigns={[]}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No campaign data available')).toBeInTheDocument();
    });
  });

  it('maintains brutalist styling with new features', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    await waitFor(() => {
      // Check export button styling
      const exportButton = screen.getByText('Export');
      expect(exportButton).toHaveClass('border-2');
      expect(exportButton).toHaveClass('border-white');

      // Check compare button styling
      const compareButton = screen.getByText('Compare');
      expect(compareButton).toHaveClass('border-2');
      expect(compareButton).toHaveClass('border-white');

      // Check checkbox styling
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveClass('border-2');
        expect(checkbox).toHaveClass('border-white');
        expect(checkbox).toHaveClass('bg-black');
      });
    });
  });

  it('handles date range edge cases', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    const startDateInput = screen.getAllByTestId('date-picker')[0];
    const endDateInput = screen.getAllByTestId('date-picker')[1];

    // Test invalid date
    fireEvent.change(startDateInput, { target: { value: 'invalid-date' } });
    expect(mockOnDateRangeChange).not.toHaveBeenCalled();

    // Test end date before start date
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-01' } });
    expect(mockOnDateRangeChange).toHaveBeenCalledTimes(2);
  });

  it('handles WebSocket connection lifecycle correctly', async () => {
    const mockWebSocket = {
      onopen: jest.fn(),
      onmessage: jest.fn(),
      onerror: jest.fn(),
      onclose: jest.fn(),
      close: jest.fn(),
    };
    global.WebSocket = jest.fn(() => mockWebSocket as any);

    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    // Simulate connection
    mockWebSocket.onopen();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();

    // Simulate message
    const mockData = {
      type: 'metrics_update',
      data: {
        campaignId: '1',
        metrics: {
          sent: 1100,
          delivered: 1000,
          opened: 600,
        },
      },
    };
    mockWebSocket.onmessage({ data: JSON.stringify(mockData) });
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();

    // Simulate error
    mockWebSocket.onerror();
    expect(screen.getByText(/Reconnecting/)).toBeInTheDocument();

    // Simulate close
    mockWebSocket.onclose();
    expect(screen.getByText(/Reconnecting/)).toBeInTheDocument();
  });

  it('handles export functionality with all formats', async () => {
    const mockOnExport = jest.fn();
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
        onExport={mockOnExport}
      />
    );

    // Open export menu
    fireEvent.click(screen.getByText('Export'));
    
    // Test all export formats
    const formats = ['csv', 'excel', 'pdf', 'json'];
    formats.forEach(format => {
      fireEvent.click(screen.getByText(`Export as ${format.toUpperCase()}`));
      expect(mockOnExport).toHaveBeenCalledWith(format);
    });
  });

  it('shows export status messages correctly', async () => {
    const mockOnExport = jest.fn().mockRejectedValue(new Error('Export failed'));
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
        onExport={mockOnExport}
      />
    );

    // Test error state
    fireEvent.click(screen.getByText('Export'));
    fireEvent.click(screen.getByText('Export as CSV'));
    expect(await screen.findByText('Export failed')).toBeInTheDocument();

    // Test loading state
    expect(screen.getByText('Exporting...')).toBeInTheDocument();
  });

  it('handles campaign comparison with different views', async () => {
    const mockOnCompare = jest.fn();
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
        onCompare={mockOnCompare}
      />
    );

    // Select campaigns
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    // Open comparison
    fireEvent.click(screen.getByText('Compare'));
    expect(screen.getByText('Campaign Comparison')).toBeInTheDocument();

    // Test view switching
    const views = ['Table', 'Chart', 'Metrics'];
    views.forEach(view => {
      fireEvent.click(screen.getByText(view));
      expect(screen.getByText(view)).toHaveClass('bg-white');
    });
  });

  it('handles comparison with different metrics', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    // Select campaigns and open comparison
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByText('Compare'));

    // Switch to metrics view
    fireEvent.click(screen.getByText('Metrics'));

    // Verify all metrics are displayed
    const metrics = ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'replies', 'meetings'];
    metrics.forEach(metric => {
      expect(screen.getByText(metric.charAt(0).toUpperCase() + metric.slice(1))).toBeInTheDocument();
    });
  });

  it('maintains brutalist styling in all new components', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    // Test export button styling
    const exportButton = screen.getByText('Export');
    expect(exportButton).toHaveClass('border-2');
    expect(exportButton).toHaveClass('border-white');

    // Test comparison view styling
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByText('Compare'));

    const comparisonContainer = screen.getByText('Campaign Comparison').parentElement;
    expect(comparisonContainer).toHaveClass('border-2');
    expect(comparisonContainer).toHaveClass('border-white');

    // Test view toggle buttons
    const viewButtons = screen.getAllByRole('button', { name: /Table|Chart|Metrics/ });
    viewButtons.forEach(button => {
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-white');
    });
  });

  it('handles offline mode gracefully', async () => {
    const mockWebSocket = {
      onopen: jest.fn(),
      onerror: jest.fn(),
      close: jest.fn(),
    };
    global.WebSocket = jest.fn(() => mockWebSocket as any);

    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    // Simulate multiple connection failures
    for (let i = 0; i < 4; i++) {
      mockWebSocket.onerror();
    }

    expect(screen.getByText('Offline Mode - Using cached data')).toBeInTheDocument();
  });

  it('renders different chart types correctly', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    // Select campaigns and open comparison
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByText('Compare'));

    // Switch to chart view
    fireEvent.click(screen.getByText('Chart'));

    // Test line chart
    fireEvent.click(screen.getByText('Line'));
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    // Test bar chart
    fireEvent.click(screen.getByText('Bar'));
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    // Test pie chart
    fireEvent.click(screen.getByText('Pie'));
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('handles fullscreen mode correctly', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    // Select campaigns and open comparison
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByText('Compare'));
    fireEvent.click(screen.getByText('Chart'));

    // Toggle fullscreen
    const fullscreenButton = screen.getByRole('button', { name: '' });
    fireEvent.click(fullscreenButton);
    
    const chartContainer = screen.getByTestId('line-chart').parentElement?.parentElement;
    expect(chartContainer).toHaveClass('fixed');
    expect(chartContainer).toHaveClass('inset-0');
    expect(chartContainer).toHaveClass('z-50');
  });

  it('maintains brutalist styling in charts', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    // Select campaigns and open comparison
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByText('Compare'));
    fireEvent.click(screen.getByText('Chart'));

    // Check chart container styling
    const chartContainer = screen.getByTestId('line-chart').parentElement?.parentElement;
    expect(chartContainer).toHaveClass('border-2');
    expect(chartContainer).toHaveClass('border-white');

    // Check chart type buttons
    const chartButtons = screen.getAllByRole('button', { name: /Line|Bar|Pie/ });
    chartButtons.forEach(button => {
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-white');
    });
  });

  it('updates chart data when metric changes', async () => {
    render(
      <AnalyticsDashboard
        campaigns={mockCampaigns}
        dateRange={mockDateRange}
        onDateRangeChange={mockOnDateRangeChange}
      />
    );

    // Select campaigns and open comparison
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByText('Compare'));
    fireEvent.click(screen.getByText('Chart'));

    // Change metric
    const metricSelect = screen.getByRole('combobox', { name: /metric/i });
    fireEvent.change(metricSelect, { target: { value: 'opened' } });

    // Verify chart updates
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  describe('Chart Types and Annotations', () => {
    beforeEach(() => {
      render(<AnalyticsDashboard campaigns={mockCampaigns} />);
      fireEvent.click(screen.getByText('Compare Campaigns'));
      fireEvent.click(screen.getByText('Visualization'));
    });

    it('should switch between different chart types', () => {
      const chartTypes = ['Line', 'Bar', 'Pie', 'Scatter', 'Area', 'Heatmap'];
      chartTypes.forEach(type => {
        fireEvent.click(screen.getByText(type));
        expect(screen.getByText(type)).toHaveClass('bg-white');
      });
    });

    it('should show metric selection for scatter plot', () => {
      fireEvent.click(screen.getByText('Scatter'));
      expect(screen.getByText('Sent')).toBeInTheDocument();
      expect(screen.getByText('Opened')).toBeInTheDocument();
    });

    it('should update scatter plot when metrics are changed', async () => {
      fireEvent.click(screen.getByText('Scatter'));
      fireEvent.change(screen.getByDisplayValue('Sent'), { target: { value: 'clicked' } });
      fireEvent.change(screen.getByDisplayValue('Opened'), { target: { value: 'replies' } });
      await waitFor(() => {
        expect(screen.getByText('Clicked')).toBeInTheDocument();
        expect(screen.getByText('Replies')).toBeInTheDocument();
      });
    });

    it('should toggle annotations visibility', () => {
      const toggleButton = screen.getByText('Show Annotations');
      expect(toggleButton).toBeInTheDocument();
      fireEvent.click(toggleButton);
      expect(screen.getByText('Hide Annotations')).toBeInTheDocument();
    });

    it('should show enhanced tooltips with campaign details', async () => {
      fireEvent.click(screen.getByText('Scatter'));
      const chart = screen.getByTestId('chart-container');
      fireEvent.mouseOver(chart);
      await waitFor(() => {
        expect(screen.getByText('Campaign Performance')).toBeInTheDocument();
        expect(screen.getByText(/Open Rate: \d+\.\d+%/)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty campaign data', () => {
      render(<AnalyticsDashboard campaigns={[]} />);
      expect(screen.getByText('No campaigns available')).toBeInTheDocument();
    });

    it('should handle invalid metric combinations', () => {
      render(<AnalyticsDashboard campaigns={mockCampaigns} />);
      fireEvent.click(screen.getByText('Compare Campaigns'));
      fireEvent.click(screen.getByText('Visualization'));
      fireEvent.click(screen.getByText('Scatter'));
      
      // Try to select invalid metrics
      fireEvent.change(screen.getByDisplayValue('Sent'), { target: { value: 'invalid' } });
      expect(screen.getByText('Error loading chart data')).toBeInTheDocument();
    });

    it('should handle real-time update failures', async () => {
      const mockWebSocket = {
        onmessage: null,
        onerror: null,
        close: jest.fn(),
      };
      global.WebSocket = jest.fn(() => mockWebSocket as any);

      render(<AnalyticsDashboard campaigns={mockCampaigns} />);
      
      // Simulate WebSocket error
      mockWebSocket.onerror(new Error('Connection failed'));
      
      await waitFor(() => {
        expect(screen.getByText('Error updating metrics')).toBeInTheDocument();
      });
    });
  });

  describe('Brutalist Styling', () => {
    it('should maintain brutalist theme in new chart types', () => {
      render(<AnalyticsDashboard campaigns={mockCampaigns} />);
      fireEvent.click(screen.getByText('Compare Campaigns'));
      fireEvent.click(screen.getByText('Visualization'));

      const chartTypes = ['Scatter', 'Area', 'Heatmap'];
      chartTypes.forEach(type => {
        fireEvent.click(screen.getByText(type));
        const chartContainer = screen.getByTestId('chart-container');
        expect(chartContainer).toHaveClass('bg-black');
        expect(chartContainer).toHaveClass('border-white');
      });
    });

    it('should maintain high contrast in annotations', () => {
      render(<AnalyticsDashboard campaigns={mockCampaigns} />);
      fireEvent.click(screen.getByText('Compare Campaigns'));
      fireEvent.click(screen.getByText('Visualization'));
      fireEvent.click(screen.getByText('Show Annotations'));

      const annotation = screen.getByText('50% Threshold');
      expect(annotation).toHaveClass('text-white');
      expect(annotation.parentElement).toHaveClass('border-white');
    });
  });
}); 