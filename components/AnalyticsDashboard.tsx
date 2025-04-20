import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChartBarIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  FilterIcon,
  ArrowDownTrayIcon,
  ChartLineIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  ChartPieIcon,
  ArrowsPointingOutIcon,
  ChartScatterIcon,
  ChartAreaIcon,
  ChartHeatmapIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
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
  Annotation,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import Chatbot from './Chatbot';
import { User, AnalyticsPermissions, getAnalyticsPermissions } from '../types/auth';

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

interface CampaignMetrics {
  id: string;
  name: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  replies: number;
  meetings: number;
  startDate: string;
  endDate: string;
}

interface AnalyticsData {
  totalLeads: number;
  openRate: number;
  responseRate: number;
  meetings: number;
  recentActivity: {
    id: string;
    type: string;
    leadName: string;
    createdAt: string;
  }[];
  trends: {
    date: string;
    opens: number;
    clicks: number;
    responses: number;
  }[];
}

interface AnalyticsDashboardProps {
  campaigns: CampaignMetrics[];
  dateRange: {
    start: string;
    end: string;
  };
  onDateRangeChange: (start: string, end: string) => void;
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

interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      position: 'top' as const;
      labels: {
        color: string;
        font: {
          size: number;
          weight: string;
        };
      };
    };
    title: {
      display: boolean;
      text: string;
      color: string;
      font: {
        size: number;
        weight: string;
      };
    };
  };
  scales?: {
    y?: {
      ticks: {
        color: string;
      };
      grid: {
        color: string;
      };
    };
    x?: {
      ticks: {
        color: string;
      };
      grid: {
        color: string;
      };
    };
  };
}

interface EnhancedChartOptions extends ChartOptions {
  plugins: ChartOptions['plugins'] & {
    annotation?: {
      annotations: Record<string, ChartAnnotation>;
    };
    tooltip?: {
      callbacks: {
        label: (context: any) => string;
        title: (context: any) => string;
      };
    };
  };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  campaigns,
  dateRange,
  onDateRangeChange,
  onExport,
  onCompare,
  user,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
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
    type: 'table',
    metric: 'sent',
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const permissions = getAnalyticsPermissions(user);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket('wss://api.winston-ai.com/ws/analytics');
      
      ws.onopen = () => {
        setWsState(prev => ({
          ...prev,
          isConnected: true,
          lastError: null,
          retryCount: 0,
        }));
        setIsOffline(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'metrics_update') {
            setLastUpdated(new Date());
            setData(prev => ({
              ...prev,
              recentActivity: [
                {
                  id: data.data.id,
                  type: data.data.type,
                  leadName: data.data.leadName,
                  createdAt: new Date().toISOString(),
                },
                ...(prev?.recentActivity || []).slice(0, 9),
              ],
            }));
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsState(prev => ({
          ...prev,
          isConnected: false,
          lastError: 'WebSocket connection error',
        }));
        handleConnectionError();
      };

      ws.onclose = () => {
        setWsState(prev => ({
          ...prev,
          isConnected: false,
        }));
        handleConnectionError();
      };

      return ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      handleConnectionError();
      return null;
    }
  }, []);

  const handleConnectionError = useCallback(() => {
    if (wsState.retryCount < MAX_RETRIES) {
      setTimeout(() => {
        setWsState(prev => ({
          ...prev,
          retryCount: prev.retryCount + 1,
        }));
        connectWebSocket();
      }, RETRY_DELAY);
    } else {
      setIsOffline(true);
      setOfflineData(campaigns);
    }
  }, [wsState.retryCount, campaigns, connectWebSocket]);

  useEffect(() => {
    const ws = connectWebSocket();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket]);

  const calculateTotals = () => {
    return campaigns.reduce((acc, campaign) => ({
      sent: acc.sent + campaign.sent,
      delivered: acc.delivered + campaign.delivered,
      opened: acc.opened + campaign.opened,
      clicked: acc.clicked + campaign.clicked,
      bounced: acc.bounced + campaign.bounced,
      replies: acc.replies + campaign.replies,
      meetings: acc.meetings + campaign.meetings,
    }), {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      replies: 0,
      meetings: 0,
    });
  };

  const totals = calculateTotals();

  const calculateRates = () => {
    return {
      deliveryRate: totals.sent > 0 ? (totals.delivered / totals.sent) * 100 : 0,
      openRate: totals.delivered > 0 ? (totals.opened / totals.delivered) * 100 : 0,
      clickRate: totals.opened > 0 ? (totals.clicked / totals.opened) * 100 : 0,
      bounceRate: totals.sent > 0 ? (totals.bounced / totals.sent) * 100 : 0,
      replyRate: totals.delivered > 0 ? (totals.replies / totals.delivered) * 100 : 0,
      meetingRate: totals.replies > 0 ? (totals.meetings / totals.replies) * 100 : 0,
    };
  };

  const rates = calculateRates();

  const handleExport = async (format: 'csv' | 'pdf' | 'excel' | 'json') => {
    setExportState({ isExporting: true, error: null, success: false });
    try {
      if (onExport) {
        await onExport(format);
        setExportState({ isExporting: false, error: null, success: true });
      }
    } catch (error) {
      setExportState({ 
        isExporting: false, 
        error: error instanceof Error ? error.message : 'Export failed', 
        success: false 
      });
    }
  };

  const handleCompare = () => {
    if (onCompare && selectedCampaigns.length >= 2) {
      setShowComparison(true);
      onCompare(selectedCampaigns);
    }
  };

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const MetricCard = ({ title, value, change, icon: Icon }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
  }) => (
    <div className="bg-black border-2 border-white p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-bold text-white uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-white">{value}</p>
            {change !== undefined && (
              <div className={`ml-2 flex items-baseline text-sm font-bold ${
                change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {change >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4" />
                )}
                <span className="sr-only">{change >= 0 ? 'Increased' : 'Decreased'} by</span>
                {Math.abs(change)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const chartOptions: ChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      title: {
        display: true,
        text: 'Campaign Performance',
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  }), []);

  const enhancedChartOptions: EnhancedChartOptions = useMemo(() => ({
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      annotation: showAnnotations ? {
        annotations: {
          threshold: {
            type: 'line',
            yMin: 0.5,
            yMax: 0.5,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 2,
            label: {
              content: '50% Threshold',
              enabled: true,
              position: 'right',
            },
          },
        },
      } : undefined,
      tooltip: {
        callbacks: {
          label: (context) => {
            const campaign = campaigns.find(c => c.id === context.raw.id);
            return [
              `Campaign: ${campaign?.name}`,
              `${selectedMetrics.x}: ${context.raw.x}`,
              `${selectedMetrics.y}: ${context.raw.y}`,
              `Open Rate: ${((campaign?.opened || 0) / (campaign?.sent || 1) * 100).toFixed(1)}%`,
            ];
          },
          title: (context) => `Campaign Performance`,
        },
      },
    },
  }), [chartOptions, showAnnotations, campaigns, selectedMetrics]);

  const chartData = useMemo(() => {
    if (!showComparison || selectedCampaigns.length < 2) return null;

    const selectedCampaignsData = campaigns.filter(campaign => 
      selectedCampaigns.includes(campaign.id)
    );

    const labels = selectedCampaignsData.map(campaign => campaign.name);
    const metricData = selectedCampaignsData.map(campaign => 
      campaign[comparisonView.metric as keyof CampaignMetrics]
    );

    return {
      labels,
      datasets: [
        {
          label: comparisonView.metric.charAt(0).toUpperCase() + comparisonView.metric.slice(1),
          data: metricData,
          borderColor: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 2,
        },
      ],
    };
  }, [showComparison, selectedCampaigns, campaigns, comparisonView.metric]);

  const scatterData = useMemo(() => {
    if (!showComparison || selectedCampaigns.length < 2) return null;

    const selectedCampaignsData = campaigns.filter(campaign => 
      selectedCampaigns.includes(campaign.id)
    );

    return {
      datasets: [{
        label: 'Campaign Performance',
        data: selectedCampaignsData.map(campaign => ({
          x: campaign[selectedMetrics.x],
          y: campaign[selectedMetrics.y],
          id: campaign.id,
          name: campaign.name,
        })),
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderColor: '#ffffff',
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }],
    };
  }, [showComparison, selectedCampaigns, campaigns, selectedMetrics]);

  const renderChart = () => {
    if (!chartData) return null;

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={enhancedChartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={enhancedChartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={enhancedChartOptions} />;
      case 'scatter':
        return <Scatter data={scatterData} options={enhancedChartOptions} />;
      case 'area':
        return <Line 
          data={{
            ...chartData,
            datasets: chartData.datasets.map(dataset => ({
              ...dataset,
              fill: true,
            })),
          }} 
          options={enhancedChartOptions} 
        />;
      case 'heatmap':
        return <div className="h-full flex items-center justify-center">
          <p className="text-white">Heatmap visualization coming soon</p>
        </div>;
      default:
        return null;
    }
  };

  if (loading) return <div className="animate-pulse">Loading analytics...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
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
          {permissions.canExportData && (
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="border-2 border-white px-4 py-2 text-white font-bold hover:bg-white hover:text-black transition-colors"
              disabled={exportState.isExporting}
            >
              <ArrowDownTrayIcon className="h-5 w-5 inline-block mr-2" />
              {exportState.isExporting ? 'Exporting...' : 'Export'}
            </button>
          )}
          
          {permissions.canCompareCampaigns && (
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
            <QuestionMarkCircleIcon className="h-5 w-5 inline-block mr-2" />
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Emails Sent"
          value={totals.sent}
          change={5}
          icon={EnvelopeIcon}
        />
        <MetricCard
          title="Open Rate"
          value={`${rates.openRate.toFixed(1)}%`}
          change={2.5}
          icon={ChartBarIcon}
        />
        <MetricCard
          title="Reply Rate"
          value={`${rates.replyRate.toFixed(1)}%`}
          change={-1.2}
          icon={UserGroupIcon}
        />
        <MetricCard
          title="Meeting Rate"
          value={`${rates.meetingRate.toFixed(1)}%`}
          change={3.8}
          icon={ClockIcon}
        />
      </div>

      <div className="border-2 border-white">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Campaign Performance</h3>
            <div className="flex space-x-2">
              <button className="border-2 border-white px-3 py-1 text-white font-bold hover:bg-white hover:text-black transition-colors">
                <ChartLineIcon className="h-5 w-5 inline-block mr-2" />
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
                <ChartLineIcon className="h-5 w-5 inline-block mr-2" />
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`border-2 border-white px-3 py-1 ${
                  chartType === 'bar' ? 'bg-white text-black' : 'text-white'
                }`}
              >
                <ChartBarIcon className="h-5 w-5 inline-block mr-2" />
                Bar
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`border-2 border-white px-3 py-1 ${
                  chartType === 'pie' ? 'bg-white text-black' : 'text-white'
                }`}
              >
                <ChartPieIcon className="h-5 w-5 inline-block mr-2" />
                Pie
              </button>
              {permissions.canAccessAdvancedCharts && (
                <>
                  <button
                    onClick={() => setChartType('scatter')}
                    className={`border-2 border-white px-3 py-1 ${
                      chartType === 'scatter' ? 'bg-white text-black' : 'text-white'
                    }`}
                  >
                    <ChartScatterIcon className="h-5 w-5 inline-block mr-2" />
                    Scatter
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    className={`border-2 border-white px-3 py-1 ${
                      chartType === 'area' ? 'bg-white text-black' : 'text-white'
                    }`}
                  >
                    <ChartAreaIcon className="h-5 w-5 inline-block mr-2" />
                    Area
                  </button>
                  <button
                    onClick={() => setChartType('heatmap')}
                    className={`border-2 border-white px-3 py-1 ${
                      chartType === 'heatmap' ? 'bg-white text-black' : 'text-white'
                    }`}
                  >
                    <ChartHeatmapIcon className="h-5 w-5 inline-block mr-2" />
                    Heatmap
                  </button>
                </>
              )}
            </div>
            <div className="flex space-x-4">
              {permissions.canManageAnnotations && (
                <button
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  className="border-2 border-white px-3 py-1 text-white hover:bg-white hover:text-black"
                >
                  <InformationCircleIcon className="h-5 w-5 inline-block mr-2" />
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
  );
};

export default AnalyticsDashboard; 