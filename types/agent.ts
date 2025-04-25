export interface LogEntry {
  message: string;
  timestamp: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  details?: Record<string, any>;
  rowNumber?: number;
  email?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  version?: string;
  lastModified?: string;
}

export interface CSVRow {
  name: string;
  email: string;
  company?: string;
  role?: string;
  status?: EmailStatus;
  lastContacted?: string;
  optOut?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface ClassificationResult {
  label: 'interested' | 'not_interested' | 'follow_up' | 'opted_out' | 'unknown';
  confidence: number;
  reasoning?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface AgentState {
  isProcessing: boolean;
  currentTask?: string;
  progress?: number;
  error?: string;
  cooldownUntil?: number;
  processedRows: number;
  totalRows: number;
  successCount: number;
  errorCount: number;
}

export interface EmailStatus {
  sent: boolean;
  sentAt?: string;
  error?: string;
  replied?: boolean;
  repliedAt?: string;
  classification?: ClassificationResult;
  optedOut?: boolean;
  optedOutAt?: string;
}

export interface AuditLogEntry {
  timestamp: string;
  action: 'email_sent' | 'email_failed' | 'reply_received' | 'opt_out' | 'classification';
  email: string;
  details: Record<string, any>;
  status: 'success' | 'error' | 'pending';
}

export interface BatchProcessingConfig {
  batchSize: number;
  delayBetweenBatches: number;
  maxRetries: number;
  maxConcurrent: number;
} 