import { supabase } from '@/lib/supabase';

interface MonitoringEvent {
  type: 'page_view' | 'user_action' | 'error' | 'performance';
  data: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

class MonitoringService {
  private events: MonitoringEvent[] = [];
  private isEnabled = process.env.NODE_ENV === 'production';

  async logEvent(type: MonitoringEvent['type'], data: Record<string, any>) {
    if (!this.isEnabled) return;

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      const event: MonitoringEvent = {
        type,
        data,
        timestamp: new Date().toISOString(),
        userId: session?.user?.id,
        sessionId: session?.access_token?.slice(0, 8), // Use part of token as session ID
      };

      this.events.push(event);
      
      // In a real implementation, you'd send this to your monitoring service
      console.log('Monitoring event:', event);
    } catch (error) {
      console.error('Failed to log monitoring event:', error);
    }
  }

  async logPageView(path: string, additionalData?: Record<string, any>) {
    await this.logEvent('page_view', {
      path,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      ...additionalData,
    });
  }

  async logUserAction(action: string, additionalData?: Record<string, any>) {
    await this.logEvent('user_action', {
      action,
      ...additionalData,
    });
  }

  async logError(error: Error, context?: Record<string, any>) {
    await this.logEvent('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  async logPerformance(metric: string, value: number, additionalData?: Record<string, any>) {
    await this.logEvent('performance', {
      metric,
      value,
      ...additionalData,
    });
  }

  getEvents(): MonitoringEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

export const monitoring = new MonitoringService(); 