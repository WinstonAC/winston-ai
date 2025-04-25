import React, { useRef, useEffect, useState } from 'react';
import { LogEntry } from '@/types/agent';

interface AgentLogProps {
  logs: LogEntry[];
  maxHeight?: string;
  title?: string;
  onClear?: () => void;
  onExport?: () => void;
  autoScroll?: boolean;
}

const LogIcon = {
  info: '📝',
  success: '✅',
  error: '❌',
  warning: '⚠️',
};

const LogTypeColors = {
  info: 'text-blue-200',
  success: 'text-green-200',
  error: 'text-red-200',
  warning: 'text-yellow-200',
};

export const AgentLog: React.FC<AgentLogProps> = ({
  logs,
  maxHeight = '400px',
  title = '🧠 Agent Log',
  onClear,
  onExport,
  autoScroll = true
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'error' | 'success' | 'warning' | 'info'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Filter and search logs
  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.type === filter;
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Format timestamp to local time
  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };

  // Render log details
  const renderLogDetails = (log: LogEntry) => {
    if (!log.details) return null;
    return (
      <div className="ml-8 mt-1 text-xs text-gray-400">
        {Object.entries(log.details).map(([key, value]) => (
          <div key={key}>
            <span className="font-semibold">{key}:</span>{' '}
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-gray-900 rounded-lg shadow-xl overflow-hidden ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center">
            {title}
          </h2>
          <div className="flex items-center space-x-2">
            {onExport && (
              <button
                onClick={onExport}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Export
              </button>
            )}
            {onClear && (
              <button
                onClick={onClear}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              {isExpanded ? 'Minimize' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-2 flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-gray-700 text-white text-sm rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
          </select>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white text-sm rounded px-2 py-1 flex-1"
          />
        </div>
      </div>

      {/* Log Content */}
      <div 
        className="overflow-y-auto px-4"
        style={{ maxHeight: isExpanded ? 'calc(100vh - 200px)' : maxHeight }}
      >
        {filteredLogs.length === 0 ? (
          <div className="py-4 text-gray-400 text-center">
            {logs.length === 0 ? 'No agent activity yet. Waiting for tasks...' : 'No matching logs found.'}
          </div>
        ) : (
          <div className="space-y-2 py-4">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className="group flex flex-col animate-fade-in"
              >
                <div className="flex items-start space-x-2 text-sm">
                  <span className="flex-shrink-0">
                    {LogIcon[log.type || 'info']}
                  </span>
                  <span className="text-gray-400 flex-shrink-0">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className={`${LogTypeColors[log.type || 'info']} flex-1`}>
                    {log.message}
                    {log.email && (
                      <span className="text-gray-400"> - {log.email}</span>
                    )}
                    {log.rowNumber && (
                      <span className="text-gray-400"> (Row {log.rowNumber})</span>
                    )}
                  </span>
                </div>
                {renderLogDetails(log)}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>

      {/* Footer with Stats */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
        <div className="text-xs text-gray-400 flex items-center justify-between">
          <div>
            Total entries: {logs.length} | 
            Errors: {logs.filter(l => l.type === 'error').length} | 
            Success: {logs.filter(l => l.type === 'success').length}
          </div>
          <div>
            Filtered: {filteredLogs.length} / {logs.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLog; 