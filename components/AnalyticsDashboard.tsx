import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import {
  ChartBarIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  ChartPieIcon,
  ArrowsPointingOutIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartTypeRegistry,
  TooltipItem,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import Chatbot from './Chatbot';
import { User } from '@/types/auth';
import { CampaignMetrics, AnalyticsData } from '@/types/analytics';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AnnotationOptions } from 'chartjs-plugin-annotation';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

type DataAccessLevel = 'own' | 'team' | 'department' | 'organization';

interface AnalyticsDashboardProps {
  campaigns: CampaignMetrics[];
  initialDateRange?: {
    start: Date;
    end: Date;
  };
  onDateRangeChange: (start: Date, end: Date) => void;
  onExport?: (format: 'csv' | 'pdf' | 'excel' | 'json') => void;
  onCompare?: (campaignIds: string[]) => void;
  user: User;
}

interface WebSocketState {
  isConnected: boolean;
  lastError: string | null;
  retryCount: number;
}

interface ExportState {
  isExporting: boolean;
  error: string | null;
  success: boolean;
}

interface ComparisonView {
  type: 'table' | 'chart' | 'metrics';
  metric: keyof CampaignMetrics;
}

interface ChartAnnotation {
  type: 'line' | 'box';
  yMin?: number;
  yMax?: number;
  xMin?: number;
  xMax?: number;
  borderColor: string;
  borderWidth: number;
  label?: {
    content: string;
    enabled: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
}

interface ChartLabelFont {
  family: string;
  size: number;
}

interface ChartTicks {
  color: string;
  font: ChartLabelFont;
}

interface ChartGrid {
  color: string;
}

interface ChartScale {
  beginAtZero?: boolean;
  ticks: ChartTicks;
  grid: ChartGrid;
}

interface ChartScales {
  y: ChartScale;
  x: ChartScale;
}

interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  fill?: boolean;
}

interface ScatterDataPoint {
  x: number;
  y: number;
  id: string;
  name: string;
}

interface ScatterDataset {
  label: string;
  data: ScatterDataPoint[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  pointRadius: number;
  pointHoverRadius: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ScatterData {
  datasets: ScatterDataset[];
}

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

type ChartType = keyof ChartTypeRegistry;

type EnhancedChartOptions = ChartOptions & {
  plugins: {
    annotation?: {
      annotations: Record<string, AnnotationOptions>;
    };
    tooltip?: {
      callbacks: {
        label: (context: any) => string;
        title: (context: any) => string;
      };
    };
  };
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  campaigns,
  initialDateRange,
  onDateRangeChange,
  onExport,
  onCompare,
  user,
}) => {
  const { checkPermission } = usePermissions();
  const [selectedMetric, setSelectedMetric] = useState<keyof CampaignMetrics>('opened');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [wsState, setWsState] = useState<WebSocketState>({
    isConnected: false,
    lastError: null,
    retryCount: 0,
  });
  const [offlineData, setOfflineData] = useState<CampaignMetrics[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [exportState, setExportState] = useState<ExportState>({
    isExporting: false,
    error: null,
    success: false,
  });
  const [comparisonView, setComparisonView] = useState<ComparisonView>({
    type: 'chart',
    metric: 'opened',
  });
  const [showComparison, setShowComparison] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'heatmap'>('line');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState<{
    x: keyof CampaignMetrics;
    y: keyof CampaignMetrics;
  }>({ x: 'sent', y: 'opened' });
  const [showHelp, setShowHelp] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>(initialDateRange ? {
    startDate: initialDateRange.start,
    endDate: initialDateRange.end,
  } : {
    startDate: null,
    endDate: null,
  });

  const calculateTotals = useCallback(() => {
    return campaigns.reduce((acc, campaign) => {
      acc.sent += campaign.sent;
      acc.delivered += campaign.delivered;
      acc.opened += campaign.opened;
      acc.clicked += campaign.clicked;
      acc.bounced += campaign.bounced;
      acc.replies += campaign.replies;
      acc.meetings += campaign.meetings;
      return acc;
    }, {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      replies: 0,
      meetings: 0,
    });
  }, [campaigns]);

  const calculateRates = useCallback(() => {
    const totals = calculateTotals();
    return {
      deliveryRate: totals.sent > 0 ? (totals.delivered / totals.sent) * 100 : 0,
      openRate: totals.delivered > 0 ? (totals.opened / totals.delivered) * 100 : 0,
      clickRate: totals.opened > 0 ? (totals.clicked / totals.opened) * 100 : 0,
      bounceRate: totals.sent > 0 ? (totals.bounced / totals.sent) * 100 : 0,
      replyRate: totals.delivered > 0 ? (totals.replies / totals.delivered) * 100 : 0,
      meetingRate: totals.clicked > 0 ? (totals.meetings / totals.clicked) * 100 : 0,
    };
  }, [calculateTotals]);

  const totals = useMemo(() => calculateTotals(), [calculateTotals]);
  const rates = useMemo(() => calculateRates(), [calculateRates]);

  const canExportData = checkPermission('canExportData');
  const canCompareCampaigns = checkPermission('canCompareCampaigns');
  const canManageAnnotations = checkPermission('canManageAnnotations');
  const canAccessAdvancedCharts = checkPermission('canAccessAdvancedCharts');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: dateRange.startDate?.toISOString() || '',
            endDate: dateRange.endDate?.toISOString() || '',
            campaignIds: selectedCampaigns,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        setData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data');
        setData(null);
      }
    };

    fetchAnalyticsData();
  }, [dateRange, selectedCampaigns]);

  const handleExport = async (format: 'csv' | 'pdf' | 'excel' | 'json') => {
    if (!onExport) return;
    
    setExportState({ isExporting: true, error: null, success: false });
    try {
      await onExport(format);
      setExportState({ isExporting: false, error: null, success: true });
    } catch (err) {
      setExportState({
        isExporting: false,
        error: err instanceof Error ? err.message : 'Export failed',
        success: false,
      });
    }
  };

  const handleCompare = () => {
    if (!onCompare || selectedCampaigns.length < 2) return;
    onCompare(selectedCampaigns);
    setShowComparison(true);
  };

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaigns(prev =>
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, className }) => (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className="h-8 w-8 text-gray-500" />
          <h3 className="ml-3 text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {change !== undefined && (
          <div className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowTrendingUpIcon className="h-5 w-5" /> : <ArrowTrendingDownIcon className="h-5 w-5" />}
            <span className="ml-1">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  const baseChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgb(107, 114, 128)',
          font: {
            family: 'system-ui',
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const raw = context.raw || {};
            const campaign = campaigns.find(c => c[selectedMetrics.x] === raw.x && c[selectedMetrics.y] === raw.y);
            return [
              `Campaign: ${campaign?.name}`,
              `${selectedMetrics.x}: ${raw.x}`,
              `${selectedMetrics.y}: ${raw.y}`,
              `Open Rate: ${((campaign?.opened || 0) / (campaign?.sent || 1) * 100).toFixed(1)}%`,
            ];
          },
          title: () => 'Campaign Performance',
        },
      },
    },
  }), [campaigns, selectedMetrics.x, selectedMetrics.y]);

  const cartesianScales = useMemo(() => ({
    x: {
      type: 'linear' as const,
      position: 'bottom' as const,
      title: {
        display: true,
        text: selectedMetrics.x,
      },
      ticks: {
        color: 'rgb(107, 114, 128)',
        font: {
          family: 'system-ui',
          size: 12,
        },
      },
      grid: {
        color: 'rgb(243, 244, 246)',
      },
    },
    y: {
      type: 'linear' as const,
      position: 'left' as const,
      title: {
        display: true,
        text: selectedMetrics.y,
      },
      ticks: {
        color: 'rgb(107, 114, 128)',
        font: {
          family: 'system-ui',
          size: 12,
        },
      },
      grid: {
        color: 'rgb(243, 244, 246)',
      },
    },
  }), [selectedMetrics.x, selectedMetrics.y]);

  const lineChartOptions: ChartOptions<'line'> = useMemo(() => ({
    ...baseChartOptions,
    scales: cartesianScales,
  }), [baseChartOptions, cartesianScales]);

  const barChartOptions: ChartOptions<'bar'> = useMemo(() => ({
    ...baseChartOptions,
    scales: cartesianScales,
  }), [baseChartOptions, cartesianScales]);

  const scatterChartOptions: ChartOptions<'scatter'> = useMemo(() => ({
    ...baseChartOptions,
    scales: cartesianScales,
  }), [baseChartOptions, cartesianScales]);

  const pieChartOptions: ChartOptions<'pie'> = useMemo(() => ({
    ...baseChartOptions,
  }), [baseChartOptions]);

  const chartData = useMemo(() => {
    if (!selectedMetrics.x || !selectedMetrics.y || !data?.dailyMetrics) return null;
    
    const metrics = data.dailyMetrics.map(item => ({
      x: item[selectedMetrics.x as keyof typeof item],
      y: item[selectedMetrics.y as keyof typeof item]
    }));

    return {
      labels: metrics.map(m => m.x.toString()),
      datasets: [{
        label: `${selectedMetrics.y} vs ${selectedMetrics.x}`,
        data: metrics.map(m => Number(m.y)),
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 2,
        fill: false
      }]
    };
  }, [data?.dailyMetrics, selectedMetrics]);

  const scatterData = useMemo(() => {
    return {
      datasets: [{
        label: 'Campaign Performance',
        data: campaigns.map(campaign => ({
          x: campaign[selectedMetrics.x] as number,
          y: campaign[selectedMetrics.y] as number,
          id: campaign.id,
          name: campaign.name,
        })),
        backgroundColor: 'rgba(50, 205, 50, 0.5)',
        borderColor: 'rgba(50, 205, 50, 1)',
        borderWidth: 1,
        pointRadius: 6,
        pointHoverRadius: 8,
      }],
    };
  }, [campaigns, selectedMetrics.x, selectedMetrics.y]);

  const renderChart = () => {
    if (!chartData) return null;

    const typedChartData = chartData as {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        borderWidth: number;
        fill?: boolean;
      }[];
    };

    switch (chartType) {
      case 'line':
        return <Line data={typedChartData} options={lineChartOptions} />;
      case 'bar':
        return <Bar data={typedChartData} options={barChartOptions} />;
      case 'pie':
        return <Pie data={typedChartData} options={pieChartOptions} />;
      case 'scatter':
        return <Scatter data={typedChartData} options={scatterChartOptions} />;
      case 'area':
        return (
          <Line
            data={{
              ...typedChartData,
              datasets: typedChartData.datasets.map(dataset => ({
                ...dataset,
                fill: true,
              })),
            }}
            options={lineChartOptions}
          />
        );
      case 'heatmap':
        return (
          <div className="relative h-96">
            <div className="absolute inset-0">
              {/* Heatmap implementation */}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleDateChange = (date: Date | null, type: 'start' | 'end') => {
    setDateRange(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: date
    }));
  };

  if (isLoading) return <div className="animate-pulse">Loading analytics...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  if (!campaigns || campaigns.length === 0) {
    return (
      <div data-testid="loading-spinner" className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div data-testid="analytics-dashboard" className="bg-black p-6 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          data-testid="metric-card"
          title="Total Emails Sent"
          value={totals.sent}
          icon={EnvelopeIcon}
          className="border-2 border-white p-4 rounded-lg"
        />
        <MetricCard
          data-testid="metric-card"
          title="Open Rate"
          value={`${rates.openRate.toFixed(1)}%`}
          icon={ChartBarIcon}
          change={2.5}
          className="border-2 border-white p-4 rounded-lg"
        />
        <MetricCard
          data-testid="metric-card"
          title="Reply Rate"
          value={`${rates.replyRate.toFixed(1)}%`}
          icon={UserGroupIcon}
          change={-1.2}
          className="border-2 border-white p-4 rounded-lg"
        />
        <MetricCard
          data-testid="metric-card"
          title="Meeting Rate"
          value={`${rates.meetingRate.toFixed(1)}%`}
          icon={ClockIcon}
          change={3.8}
          className="border-2 border-white p-4 rounded-lg"
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Campaign Performance</h2>
        <div className="flex space-x-4">
          <DatePicker
            selected={dateRange.startDate}
            onChange={(date) => handleDateChange(date, 'start')}
            selectsStart
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            minDate={dateRange.startDate || undefined}
            maxDate={new Date()}
            className="font-mono text-[#32CD32] bg-black border-2 border-[#32CD32] px-4 py-2"
            placeholderText="Start Date"
            data-testid="date-picker"
          />
          <DatePicker
            selected={dateRange.endDate}
            onChange={(date) => handleDateChange(date, 'end')}
            selectsEnd
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            minDate={dateRange.startDate || undefined}
            maxDate={new Date()}
            className="font-mono text-[#32CD32] bg-black border-2 border-[#32CD32] px-4 py-2"
            placeholderText="End Date"
            data-testid="date-picker"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-2 border-white">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-4 text-left text-white">Campaign</th>
              <th className="p-4 text-left text-white">Sent</th>
              <th className="p-4 text-left text-white">Open Rate</th>
              <th className="p-4 text-left text-white">Click Rate</th>
              <th className="p-4 text-left text-white">Reply Rate</th>
              <th className="p-4 text-left text-white">Meetings</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-t border-gray-700">
                <td className="p-4 text-white">{campaign.name}</td>
                <td className="p-4 text-white">{campaign.sent}</td>
                <td className="p-4 text-white">{((campaign.opened / campaign.delivered) * 100).toFixed(1)}%</td>
                <td className="p-4 text-white">{((campaign.clicked / campaign.opened) * 100).toFixed(1)}%</td>
                <td className="p-4 text-white">{((campaign.replies / campaign.delivered) * 100).toFixed(1)}%</td>
                <td className="p-4 text-white">{campaign.meetings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-6 bg-black text-white p-6" data-testid="analytics-dashboard">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Campaign Analytics</h2>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
              {isOffline && (
                <span className="text-yellow-500 text-sm font-bold">
                  Offline Mode - Using cached data
                </span>
              )}
              {!isOffline && !wsState.isConnected && (
                <span className="text-red-500 text-sm font-bold">
                  Reconnecting... ({wsState.retryCount}/{MAX_RETRIES})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {canExportData && (
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="border-2 border-white px-4 py-2 text-white font-bold hover:bg-white hover:text-black transition-colors"
                disabled={exportState.isExporting}
              >
                <ArrowDownTrayIcon className="h-5 w-5 inline-block mr-2" />
                {exportState.isExporting ? 'Exporting...' : 'Export'}
              </button>
            )}
            
            {canCompareCampaigns && (
              <button
                onClick={handleCompare}
                disabled={selectedCampaigns.length < 2}
                className="border-2 border-white px-4 py-2 text-white font-bold hover:bg-white hover:text-black transition-colors disabled:opacity-50"
              >
                <ArrowsRightLeftIcon className="h-5 w-5 inline-block mr-2" />
                Compare
              </button>
            )}

            <button
              onClick={() => setShowHelp(true)}
              className="border-2 border-white px-4 py-2 text-white font-bold hover:bg-white hover:text-black transition-colors"
            >
              <InformationCircleIcon className="h-5 w-5 inline-block mr-2" />
              Help
            </button>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-white" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="bg-black border-2 border-white text-white px-3 py-1 rounded-none"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-2 border-white">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Campaign Performance</h3>
              <div className="flex space-x-2">
                <button className="border-2 border-white px-3 py-1 text-white font-bold hover:bg-white hover:text-black">
                  <ChartBarIcon className="h-5 w-5" />
                  Trends
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-white">
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Open Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Click Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Reply Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Meetings
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-gray-800">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCampaigns.includes(campaign.id)}
                          onChange={() => toggleCampaignSelection(campaign.id)}
                          className="h-4 w-4 border-2 border-white bg-black"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                        {campaign.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {campaign.sent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {((campaign.opened / campaign.delivered) * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {((campaign.clicked / campaign.opened) * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {((campaign.replies / campaign.delivered) * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {campaign.meetings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showComparison && selectedCampaigns.length >= 2 && comparisonView.type === 'chart' && (
          <div className={`border-2 border-white p-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setChartType('line')}
                  className={`border-2 border-white px-3 py-1 ${
                    chartType === 'line' ? 'bg-white text-black' : 'text-white'
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5" />
                  Line
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`border-2 border-white px-3 py-1 ${
                    chartType === 'bar' ? 'bg-white text-black' : 'text-white'
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5" />
                  Bar
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`border-2 border-white px-3 py-1 ${
                    chartType === 'pie' ? 'bg-white text-black' : 'text-white'
                  }`}
                >
                  <ChartPieIcon className="h-5 w-5" />
                  Pie
                </button>
                {canAccessAdvancedCharts && (
                  <>
                    <button
                      onClick={() => setChartType('scatter')}
                      className={`border-2 border-white px-3 py-1 ${
                        chartType === 'scatter' ? 'bg-white text-black' : 'text-white'
                      }`}
                    >
                      <ArrowsPointingOutIcon className="h-5 w-5" />
                      Scatter
                    </button>
                    <button
                      onClick={() => setChartType('area')}
                      className={`border-2 border-white px-3 py-1 ${
                        chartType === 'area' ? 'bg-white text-black' : 'text-white'
                      }`}
                    >
                      <ChartBarIcon className="h-5 w-5" />
                      Area
                    </button>
                    <button
                      onClick={() => setChartType('heatmap')}
                      className={`border-2 border-white px-3 py-1 ${
                        chartType === 'heatmap' ? 'bg-white text-black' : 'text-white'
                      }`}
                    >
                      <TableCellsIcon className="h-5 w-5" />
                      Heatmap
                    </button>
                  </>
                )}
              </div>
              <div className="flex space-x-4">
                {canManageAnnotations && (
                  <button
                    onClick={() => setShowAnnotations(!showAnnotations)}
                    className="border-2 border-white px-3 py-1 text-white hover:bg-white hover:text-black"
                  >
                    <InformationCircleIcon className="h-5 w-5" />
                    {showAnnotations ? 'Hide Annotations' : 'Show Annotations'}
                  </button>
                )}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="border-2 border-white px-3 py-1 text-white hover:bg-white hover:text-black"
                >
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {chartType === 'scatter' && (
              <div className="flex space-x-4 mb-4">
                <select
                  value={selectedMetrics.x}
                  onChange={(e) => setSelectedMetrics(prev => ({ ...prev, x: e.target.value as keyof CampaignMetrics }))}
                  className="bg-black border-2 border-white text-white px-3 py-1"
                >
                  {Object.keys(campaigns[0]).filter(key => 
                    !['id', 'name', 'startDate', 'endDate'].includes(key)
                  ).map(metric => (
                    <option key={metric} value={metric}>
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedMetrics.y}
                  onChange={(e) => setSelectedMetrics(prev => ({ ...prev, y: e.target.value as keyof CampaignMetrics }))}
                  className="bg-black border-2 border-white text-white px-3 py-1"
                >
                  {Object.keys(campaigns[0]).filter(key => 
                    !['id', 'name', 'startDate', 'endDate'].includes(key)
                  ).map(metric => (
                    <option key={metric} value={metric}>
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="h-96">
              {renderChart()}
            </div>
          </div>
        )}

        {showHelp && <Chatbot initialContext="analytics" onClose={() => setShowHelp(false)} />}
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 