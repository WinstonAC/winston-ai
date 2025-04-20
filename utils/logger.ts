type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // In development, also console log
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = entry.level === 'error' ? 'error' : 'log';
      console[consoleMethod](`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`, entry.data || '');
    }

    // Here you would typically send logs to your logging service
    // Example: sendToLoggingService(entry);
  }

  debug(message: string, data?: any) {
    this.addLog(this.formatMessage('debug', message, data));
  }

  info(message: string, data?: any) {
    this.addLog(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any) {
    this.addLog(this.formatMessage('warn', message, data));
  }

  error(message: string, data?: any) {
    this.addLog(this.formatMessage('error', message, data));
  }

  getLogs(level?: LogLevel): LogEntry[] {
    return level ? this.logs.filter(log => log.level === level) : this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();

// Example usage:
// logger.info('User logged in', { userId: '123' });
// logger.error('API request failed', { status: 500, endpoint: '/api/users' }); 